// paypal-webhook
// Endpoint pubblico chiamato direttamente da PayPal (nessun JWT Supabase —
// l'autenticazione e' la firma webhook di PayPal). Deploy con verify_jwt=false;
// verifyWebhookSignature() qui sotto e' il vero confine di autenticazione.
//
// Questa funzione e' l'unica fonte di verita' per lo stato subscription —
// create/cancel-paypal-subscription non scrivono mai su `profiles` direttamente.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { getPayPalAccessToken, PAYPAL_API_BASE } from './paypal-helpers.ts'

interface PayPalWebhookEvent {
  id: string
  event_type: string
  resource: {
    id?: string
    custom_id?: string
    billing_agreement_id?: string
    billing_info?: { next_billing_time?: string }
    [key: string]: unknown
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // service_role bypassa la RLS — necessario perche' questa funzione non ha
  // una sessione utente e deve aggiornare profili arbitrari per subscription id.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const rawBody = await req.text()
    const event = JSON.parse(rawBody) as PayPalWebhookEvent

    const isValid = await verifyWebhookSignature(req, rawBody)
    if (!isValid) {
      console.error('PayPal webhook signature verification failed')
      return new Response('Invalid signature', { status: 401 })
    }

    // Reclama atomicamente questo evento: se un'altra delivery ha gia'
    // inserito questo event_id, `inserted` torna vuoto e saltiamo ogni side
    // effect. Chiude la race SELECT-then-INSERT che un controllo
    // check-then-act ingenuo avrebbe sotto delivery webhook concorrenti/retry.
    const { data: inserted, error: insertError } = await supabase
      .from('processed_paypal_events')
      .upsert(
        { event_id: event.id, event_type: event.event_type },
        { onConflict: 'event_id', ignoreDuplicates: true }
      )
      .select('event_id')

    if (insertError) {
      console.error('Idempotency upsert failed:', insertError)
      return new Response('Internal error', { status: 500 })
    }

    if (!inserted || inserted.length === 0) {
      return new Response('OK (duplicate, already processed)', { status: 200 })
    }

    await handleEvent(supabase, event)

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('paypal-webhook error:', err)
    // 500 cosi' PayPal ritenta la delivery — potremmo non aver ancora registrato l'evento.
    return new Response('Internal error', { status: 500 })
  }
})

async function handleEvent(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  event: PayPalWebhookEvent
): Promise<void> {
  const subscriptionId = event.resource.id
  const customId = event.resource.custom_id

  switch (event.event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED': {
      if (!customId) {
        console.error('ACTIVATED event missing custom_id, cannot map to user:', event.id)
        return
      }

      const expiresAt = await fetchNextBillingTime(subscriptionId)

      const { error } = await supabase
        .from('profiles')
        .update({
          plan: 'premium',
          paypal_subscription_id: subscriptionId,
          subscription_status: 'active',
          subscription_expires_at: expiresAt,
        })
        .eq('id', customId)

      if (error) console.error('Failed to activate premium for user', customId, error)
      break
    }

    case 'BILLING.SUBSCRIPTION.CANCELLED':
    case 'BILLING.SUBSCRIPTION.SUSPENDED': {
      // Downgrade immediato — nessun periodo di grazia in questo MVP. Se in
      // futuro serve un grace period fino a subscription_expires_at, cambiare
      // qui per impostare solo subscription_status e far leggere expires_at
      // altrove invece di flippare subito `plan`.
      const { error } = await findAndUpdateProfile(supabase, subscriptionId, customId, {
        plan: 'free',
        subscription_status: 'cancelled',
      })
      if (error) console.error('Failed to downgrade (cancel/suspend) for subscription', subscriptionId, error)
      break
    }

    case 'BILLING.SUBSCRIPTION.EXPIRED': {
      const { error } = await findAndUpdateProfile(supabase, subscriptionId, customId, {
        plan: 'free',
        subscription_status: 'expired',
      })
      if (error) console.error('Failed to downgrade (expired) for subscription', subscriptionId, error)
      break
    }

    case 'PAYMENT.SALE.COMPLETED': {
      // Pagamento di rinnovo: estende expires_at se risolviamo la subscription
      // padre. Non critico — ingoia errori, non fa fallire il webhook.
      const parentSubId = event.resource.billing_agreement_id
      if (!parentSubId) break

      const expiresAt = await fetchNextBillingTime(parentSubId)
      if (!expiresAt) break

      const { error } = await supabase
        .from('profiles')
        .update({ subscription_expires_at: expiresAt })
        .eq('paypal_subscription_id', parentSubId)

      if (error) console.error('Failed to extend expiry on renewal for', parentSubId, error)
      break
    }

    default:
      // Tipi di evento non gestiti vanno bene — gia' registrati in
      // processed_paypal_events per idempotency/audit.
      break
  }
}

/**
 * Risolve una riga profile per paypal_subscription_id prima (autoritativo una
 * volta avvenuta l'attivazione), con fallback su custom_id (lo user id) per i
 * casi limite in cui l'id non e' ancora stato persistito.
 */
async function findAndUpdateProfile(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  subscriptionId: string | undefined,
  customId: string | undefined,
  updates: Record<string, unknown>
) {
  if (subscriptionId) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('paypal_subscription_id', subscriptionId)
      .select('id')

    if (!error && data && data.length > 0) return { error: null }
  }

  if (customId) {
    return await supabase.from('profiles').update(updates).eq('id', customId)
  }

  return { error: new Error('No subscriptionId or customId to match a profile') }
}

async function fetchNextBillingTime(subscriptionId?: string): Promise<string | null> {
  if (!subscriptionId) return null
  try {
    const accessToken = await getPayPalAccessToken()
    const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.billing_info?.next_billing_time ?? null
  } catch (err) {
    console.error('fetchNextBillingTime failed (non-fatal):', err)
    return null
  }
}

/**
 * Verifica che il webhook venga davvero da PayPal usando la loro API
 * verify-webhook-signature. Questo e' il vero confine di autenticazione per
 * questa funzione (verify_jwt e' disabilitato a deploy time).
 */
async function verifyWebhookSignature(req: Request, rawBody: string): Promise<boolean> {
  const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')
  if (!webhookId) {
    console.error('PAYPAL_WEBHOOK_ID not configured')
    return false
  }

  const transmissionId = req.headers.get('paypal-transmission-id')
  const transmissionTime = req.headers.get('paypal-transmission-time')
  const certUrl = req.headers.get('paypal-cert-url')
  const authAlgo = req.headers.get('paypal-auth-algo')
  const transmissionSig = req.headers.get('paypal-transmission-sig')

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    console.error('Missing PayPal signature headers')
    return false
  }

  const accessToken = await getPayPalAccessToken()

  const res = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  })

  if (!res.ok) {
    console.error('verify-webhook-signature call failed:', await res.text())
    return false
  }

  const data = await res.json()
  return data.verification_status === 'SUCCESS'
}
