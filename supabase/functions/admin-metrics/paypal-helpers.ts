// Client PayPal REST minimale — copia locale (Edge Functions non condividono
// moduli tra funzioni diverse, ognuna e' un deploy isolato).
const PAYPAL_API_BASE = Deno.env.get('PAYPAL_API_BASE') ?? 'https://api-m.paypal.com'

export { PAYPAL_API_BASE }

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const basicAuth = btoa(`${clientId}:${clientSecret}`)

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    throw new Error(`PayPal OAuth failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  return data.access_token as string
}
