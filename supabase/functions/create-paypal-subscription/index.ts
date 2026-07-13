// create-paypal-subscription
// Chiamata dal frontend quando un utente free sceglie di fare l'upgrade.
// Crea una subscription PayPal in stato APPROVAL_PENDING e restituisce
// l'approvalUrl a cui il client deve reindirizzare l'utente.
//
// Sicurezza: richiede un JWT Supabase valido (verify_jwt=true a deploy).
// NON scrive sul DB — la subscription diventa autoritativa solo quando
// PayPal conferma l'attivazione via webhook (paypal-webhook), che resta
// l'unica fonte di verita' per lo stato di fatturazione.
//
// Errori: dettagli diagnostici (raw PayPal error body, api base, plan id)
// vanno solo in console.error (log Edge Function) — mai nella risposta al
// client, per non esporre config interna a chi triggera un errore PayPal.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'
import { getPayPalAccessToken, PAYPAL_API_BASE } from './paypal-helpers.ts'

type PlanKey = 'monthly' | 'yearly'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Missing Authorization header' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return jsonResponse({ error: 'Invalid or expired session' }, 401)
    }

    const body = await req.json().catch(() => null)
    const plan: PlanKey | undefined = body?.plan

    if (plan !== 'monthly' && plan !== 'yearly') {
      return jsonResponse({ error: 'plan must be "monthly" or "yearly"' }, 400)
    }

    const planId = plan === 'monthly'
      ? Deno.env.get('PAYPAL_PLAN_ID_MONTHLY')
      : Deno.env.get('PAYPAL_PLAN_ID_YEARLY')

    if (!planId) {
      console.error('Server plan configuration missing: PAYPAL_PLAN_ID_MONTHLY/YEARLY non impostato come secret Supabase')
      return jsonResponse({ error: 'Server plan configuration missing' }, 500)
    }

    let accessToken: string
    try {
      accessToken = await getPayPalAccessToken()
    } catch (tokenErr) {
      console.error('getPayPalAccessToken failed:', tokenErr, 'apiBase:', PAYPAL_API_BASE)
      return jsonResponse({ error: 'PayPal auth failed' }, 500)
    }

    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://pet-note.vercel.app'

    const ppRes = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `sub-${user.id}-${Date.now()}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: user.id,
        application_context: {
          brand_name: 'PetNote',
          locale: 'it-IT',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${siteUrl}/app/settings?subscription=success`,
          cancel_url: `${siteUrl}/app/settings?subscription=cancelled`,
        },
      }),
    })

    if (!ppRes.ok) {
      const errBody = await ppRes.text()
      console.error('PayPal subscription creation failed:', errBody, 'planIdUsed:', planId, 'apiBase:', PAYPAL_API_BASE)
      return jsonResponse({ error: 'PayPal subscription creation failed' }, 502)
    }

    const subscription = await ppRes.json()
    const approvalUrl = subscription.links?.find((l: { rel: string }) => l.rel === 'approve')?.href

    if (!approvalUrl) {
      console.error('PayPal response missing approval link:', JSON.stringify(subscription))
      return jsonResponse({ error: 'PayPal response missing approval link' }, 502)
    }

    return jsonResponse({ approvalUrl, subscriptionId: subscription.id }, 200)
  } catch (err) {
    console.error('create-paypal-subscription error:', err)
    return jsonResponse({ error: 'Internal error' }, 500)
  }
})

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
