// delete-account
// Eliminazione definitiva account utente — self-service da Settings.
// HARD DELETE immediato, nessun grace period (complessità sproporzionata
// per progetto solo-dev pre-lancio).
//
// Ordine step (non riordinare):
// 1. Blocca se admin — mai eliminabile via self-service.
// 2. Se abbonamento attivo: cancella su PayPal PRIMA, sincrono. Fallisce → ABORT.
// 3. Elimina oggetti Storage sotto {user_id}/ (paginato) — FK CASCADE non tocca storage.objects.
// 4. auth.admin.deleteUser() — cascata FK fa il resto (verificato live).

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'
import { getPayPalAccessToken, PAYPAL_API_BASE } from './paypal-helpers.ts'

const STORAGE_BUCKETS = ['pet-photos', 'pet-documents'] as const

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

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return jsonResponse({ error: 'Invalid or expired session' }, 401)
    }

    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('is_admin, plan, paypal_subscription_id, subscription_status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return jsonResponse({ error: 'Profile not found' }, 404)
    }

    // Step 1 — mai eliminare l'admin via self-service.
    if (profile.is_admin) {
      return jsonResponse(
        { error: 'Account amministratore — eliminazione non consentita da questo endpoint' },
        403
      )
    }

    // Step 2 — cancella subscription PayPal PRIMA, sincrono, se attiva.
    if (profile.plan === 'premium' && profile.paypal_subscription_id && profile.subscription_status === 'active') {
      const accessToken = await getPayPalAccessToken()
      const ppRes = await fetch(
        `${PAYPAL_API_BASE}/v1/billing/subscriptions/${profile.paypal_subscription_id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: 'Eliminazione account utente' }),
        }
      )

      // 204 = PayPal ha accettato. Qualunque altro status = ABORT.
      if (ppRes.status !== 204) {
        const errBody = await ppRes.text()
        console.error('PayPal cancellation failed during account deletion:', errBody)
        return jsonResponse(
          { error: "Impossibile cancellare l'abbonamento PayPal. Riprova o contatta il supporto prima di eliminare l'account." },
          502
        )
      }
      // Downgrade DB arriverà via paypal-webhook (CANCELLED). Verificato:
      // findAndUpdateProfile non erra su 0 righe — no-op silenzioso sicuro
      // se il profilo non esiste già più a quel punto.
    }

    // Da qui servono privilegi service_role.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Step 3 — file fisici: FK CASCADE non tocca storage.objects.
    // Paginato: list() ha un limite per chiamata, un utente con migliaia
    // di file verrebbe altrimenti troncato al primo batch.
    for (const bucket of STORAGE_BUCKETS) {
      const allPaths: string[] = []
      const PAGE_SIZE = 1000
      let offset = 0

      while (true) {
        const { data: files, error: listError } = await adminClient.storage
          .from(bucket)
          .list(user.id, { limit: PAGE_SIZE, offset })

        if (listError) {
          console.error(`Storage list failed for bucket ${bucket} (offset ${offset}):`, listError)
          break // non bloccante — file orfano è meglio di account bloccato
        }

        if (!files || files.length === 0) break

        allPaths.push(...files.map((f) => `${user.id}/${f.name}`))

        if (files.length < PAGE_SIZE) break // ultima pagina raggiunta
        offset += PAGE_SIZE
      }

      // Rimozione a batch — evita un'unica richiesta enorme se ci sono
      // migliaia di path accumulati dal loop sopra.
      for (let i = 0; i < allPaths.length; i += PAGE_SIZE) {
        const batch = allPaths.slice(i, i + PAGE_SIZE)
        const { error: removeError } = await adminClient.storage.from(bucket).remove(batch)
        if (removeError) {
          console.error(`Storage remove failed for bucket ${bucket} (batch from ${i}):`, removeError)
        }
      }
    }

    // Step 4 — cascata FK verificata live: profiles→pets→(vaccinations,
    // vet_visits, antiparasitics, medications, weight_logs, health_events,
    // allergies, insurance_policies, documents, share_links, reminders,
    // pet_photos) tutte CASCADE. profiles→push_subscriptions CASCADE.
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('auth.admin.deleteUser failed:', deleteError)
      return jsonResponse({ error: 'Eliminazione account fallita. Riprova o contatta il supporto.' }, 500)
    }

    return jsonResponse({ message: 'Account eliminato definitivamente.' }, 200)
  } catch (err) {
    console.error('delete-account error:', err)
    return jsonResponse({ error: 'Internal error' }, 500)
  }
})

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
