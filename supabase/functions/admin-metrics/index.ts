// admin-metrics
// Chiamata dal pannello /sys-admin. Restituisce metriche aggregate
// (utenti, pet, subscription, MRR stimato) usando service_role — l'unico
// modo per leggere across-user senza RLS.
//
// Sicurezza a 2 livelli:
// 1. verify_jwt=true a deploy (Supabase rifiuta richieste senza JWT valido)
// 2. Check applicativo qui sotto: email admin + is_admin=true dal profilo,
//    letto con un client anon-autenticato (rispetta RLS, nessun bypass
//    prima della verifica identità) — solo DOPO la conferma si crea il
//    client service_role per le query aggregate.
//
// Ogni chiamata riuscita viene loggata in admin_audit_log (service_role,
// nessuna policy pubblica su quella tabella).

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'
import { getPayPalAccessToken, PAYPAL_API_BASE } from './paypal-helpers.ts'

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') ?? 'lucaiolienrico@gmail.com'

interface ProfileRow {
  id: string
  plan: string
  paypal_subscription_id: string | null
  subscription_status: string | null
  subscription_expires_at: string | null
  is_admin: boolean
  created_at: string
}

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

    // ── Client anon-autenticato: verifica identità rispettando RLS ──────────
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await anonClient.auth.getUser()
    if (authError || !user) {
      return jsonResponse({ error: 'Invalid or expired session' }, 401)
    }

    if (user.email !== ADMIN_EMAIL) {
      return jsonResponse({ error: 'Forbidden' }, 403)
    }

    const { data: ownProfile, error: profileError } = await anonClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !ownProfile?.is_admin) {
      return jsonResponse({ error: 'Forbidden' }, 403)
    }

    // ── Gate superato: client service_role per le query aggregate ───────────
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const [
      { count: totalUsers },
      { count: totalPets },
      { count: activePets },
      { data: allProfiles },
    ] = await Promise.all([
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('pets').select('id', { count: 'exact', head: true }),
      admin.from('pets').select('id', { count: 'exact', head: true }).eq('is_active', true),
      admin.from('profiles')
        .select('id, plan, paypal_subscription_id, subscription_status, subscription_expires_at, is_admin, created_at')
        .order('created_at', { ascending: false }),
    ])

    const profiles: ProfileRow[] = allProfiles ?? []

    const freeCount    = profiles.filter(p => p.plan === 'free' && !p.is_admin).length
    const adminCount   = profiles.filter(p => p.is_admin).length
    const activePremium = profiles.filter(p => p.plan === 'premium' && p.subscription_status === 'active')
    const cancelledCount = profiles.filter(p => p.subscription_status === 'cancelled').length
    const expiredCount   = profiles.filter(p => p.subscription_status === 'expired').length

    // ── MRR stimato: risolve plan_id PayPal per ogni subscription attiva ────
    // Il DB non memorizza se una subscription e' monthly o yearly (solo
    // paypal_subscription_id) — lo chiediamo a PayPal per ricostruirlo.
    // Bounded a 100 subscription per chiamata: al volume attuale (pochi
    // utenti) e' istantaneo; a scala andrebbe cachato lato DB in una colonna
    // dedicata invece di richiamare l'API ad ogni refresh dashboard.
    const MONTHLY_PLAN_ID = Deno.env.get('PAYPAL_PLAN_ID_MONTHLY')
    const YEARLY_PLAN_ID  = Deno.env.get('PAYPAL_PLAN_ID_YEARLY')
    const MONTHLY_PRICE = 4.99
    const YEARLY_MONTHLY_EQUIVALENT = 34.99 / 12 // 2.9158...

    let mrrEstimate = 0
    let unknownPlanCount = 0

    if (activePremium.length > 0 && MONTHLY_PLAN_ID && YEARLY_PLAN_ID) {
      try {
        const accessToken = await getPayPalAccessToken()
        const subsToCheck = activePremium.slice(0, 100)

        const results = await Promise.allSettled(
          subsToCheck.map(async (p) => {
            if (!p.paypal_subscription_id) return null
            const res = await fetch(
              `${PAYPAL_API_BASE}/v1/billing/subscriptions/${p.paypal_subscription_id}`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            if (!res.ok) return null
            const sub = await res.json()
            return sub.plan_id as string | undefined
          })
        )

        for (const r of results) {
          if (r.status !== 'fulfilled' || !r.value) {
            unknownPlanCount++
            continue
          }
          if (r.value === MONTHLY_PLAN_ID) mrrEstimate += MONTHLY_PRICE
          else if (r.value === YEARLY_PLAN_ID) mrrEstimate += YEARLY_MONTHLY_EQUIVALENT
          else unknownPlanCount++
        }

        // Subscription oltre le prime 100 non controllate: contale come
        // "unknown" invece di ometterle silenziosamente dal totale.
        unknownPlanCount += Math.max(0, activePremium.length - subsToCheck.length)
      } catch (err) {
        console.error('MRR PayPal lookup failed (non-fatal):', err)
        unknownPlanCount = activePremium.length
      }
    } else {
      unknownPlanCount = activePremium.length
    }

    // ── Elenco utenti recenti con email (da auth.admin, profiles non ha email) ──
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 200 })
    const emailById = new Map(authUsers?.users.map(u => [u.id, u.email ?? '—']) ?? [])

    const recentUsers = profiles.slice(0, 20).map(p => ({
      id:                  p.id,
      email:               emailById.get(p.id) ?? '—',
      plan:                p.is_admin ? 'admin' : p.plan,
      subscriptionStatus:  p.subscription_status,
      createdAt:           p.created_at,
    }))

    // ── Audit log (service_role, non esposto al client via RLS) ─────────────
    await admin.from('admin_audit_log').insert({
      admin_id:    user.id,
      action:      'view_metrics',
      target_type: 'dashboard',
      payload:     { totalUsers, totalPets },
    })

    return jsonResponse({
      totals: {
        users:      totalUsers ?? 0,
        pets:       totalPets ?? 0,
        activePets: activePets ?? 0,
      },
      plan: {
        free:    freeCount,
        premium: activePremium.length,
        admin:   adminCount,
      },
      subscriptions: {
        active:            activePremium.length,
        cancelled:         cancelledCount,
        expired:           expiredCount,
        mrrEstimate:       Math.round(mrrEstimate * 100) / 100,
        currency:          'EUR',
        unknownPlanCount,
      },
      recentUsers,
    }, 200)
  } catch (err) {
    console.error('admin-metrics error:', err)
    return jsonResponse({ error: 'Internal error' }, 500)
  }
})

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
