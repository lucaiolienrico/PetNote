// cancel-paypal-subscription
// Chiamata dal frontend quando un utente premium cancella da Settings.
// Richiede il JWT del chiamante — la RLS su `profiles` garantisce che possa
// leggere/agire solo sulla propria subscription id, quindi qui non serve service_role.
//
// NON flippa la riga DB a 'free' — PayPal emettera' BILLING.SUBSCRIPTION.CANCELLED,
// e paypal-webhook (fonte di verita') esegue il downgrade vero e proprio.
// Questo evita una race in cui il DB dice "cancellato" ma PayPal continua ad
// addebitare per via di una chiamata di cancellazione fallita silenziosamente.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'
import { getPayPalAccessToken, PAYPAL_API_BASE } from './paypal-helpers.ts'

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

    // La RLS (profile_own) scopa automaticamente questa query alla propria riga.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('paypal_subscription_id, subscription_status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return jsonResponse({ error: 'Profile not found' }, 404)
    }

    if (!profile.paypal_subscription_id) {
      return jsonResponse({ error: 'No active PayPal subscription for this user' }, 400)
    }

    if (profile.subscription_status === 'cancelled' || profile.subscription_status === 'expired') {
      // Idempotente dal punto di vista del chiamante — gia' cancellata.
      return jsonResponse({ message: 'Subscription already cancelled' }, 200)
    }

    const body = await req.json().catch(() => ({}))
    const reason: string = body?.reason ?? "Cancellazione richiesta dall'utente"

    const accessToken = await getPayPalAccessToken()

    const ppRes = await fetch(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${profile.paypal_subscription_id}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    )

    // PayPal restituisce 204 No Content in caso di successo.
    if (ppRes.status !== 204) {
      const errBody = await ppRes.text()
      console.error('PayPal cancellation failed:', errBody)
      return jsonResponse({ error: 'PayPal cancellation failed' }, 502)
    }

    return jsonResponse({ message: 'Cancellation requested. It will be confirmed shortly.' }, 200)
  } catch (err) {
    console.error('cancel-paypal-subscription error:', err)
    return jsonResponse({ error: 'Internal error' }, 500)
  }
})

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
