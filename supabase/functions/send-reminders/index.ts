// send-reminders
// Cron giornaliero (pg_cron + pg_net, schedulato lato DB — vedi migrazione
// setup_send_reminders_cron). Trova vaccinazioni, antiparassitari e
// promemoria custom con scadenza entro 7 giorni, invia una push notification
// a ciascun proprietario tramite le sue push_subscriptions.
//
// Deploy con verify_jwt=false perche' il chiamante e' pg_net (nessuna
// sessione utente), ma l'endpoint resta pubblico via URL — protetto da un
// header condiviso (CRON_SECRET) invece che dal solo "URL non pubblicizzato",
// cosi' non e' invocabile da chiunque per spammare push ai proprietari.
//
// web-push richiede Node's crypto per firmare i JWT VAPID — funziona su
// Deno via l'npm compat layer di Supabase Edge Runtime.

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
const VAPID_SUBJECT      = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:lucaiolienrico@gmail.com'
const CRON_SECRET        = Deno.env.get('CRON_SECRET')

interface DueItem {
  ownerId:  string
  petName:  string
  label:    string   // "Vaccino" | "Antiparassitario" | "Promemoria"
  itemName: string
  dueDate:  string
}

Deno.serve(async (req: Request) => {
  // Consente sia GET (trigger manuale da browser/curl) sia POST (cron).
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // ── Auth: header condiviso invece di verify_jwt (chiamante = pg_net, non
  // un utente Supabase). Se CRON_SECRET non e' configurato, rifiuta sempre
  // — fail-closed, non fail-open su un endpoint che invia notifiche reali.
  if (!CRON_SECRET) {
    console.error('CRON_SECRET non configurato — rifiuto per sicurezza')
    return jsonResponse({ error: 'Server misconfigured' }, 500)
  }
  const providedSecret = req.headers.get('x-cron-secret')
  if (providedSecret !== CRON_SECRET) {
    return jsonResponse({ error: 'Forbidden' }, 403)
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('VAPID keys non configurate')
    return jsonResponse({ error: 'VAPID keys missing' }, 500)
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in7 = new Date(today)
  in7.setDate(today.getDate() + 7)

  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const todayStr = fmt(today)
  const in7Str   = fmt(in7)

  try {
    const [
      { data: vax, error: vaxErr },
      { data: anti, error: antiErr },
      { data: rem, error: remErr },
    ] = await Promise.all([
      supabase
        .from('vaccinations')
        .select('vaccine_name, next_due_at, pets!inner(name, owner_id)')
        .gte('next_due_at', todayStr)
        .lte('next_due_at', in7Str),
      supabase
        .from('antiparasitics')
        .select('product_name, next_due_at, pets!inner(name, owner_id)')
        .gte('next_due_at', todayStr)
        .lte('next_due_at', in7Str),
      supabase
        .from('reminders')
        .select('title, due_date, pets!inner(name, owner_id)')
        .gte('due_date', todayStr)
        .lte('due_date', in7Str),
    ])

    if (vaxErr) throw vaxErr
    if (antiErr) throw antiErr
    if (remErr) throw remErr

    type PetJoin = { name: string; owner_id: string }

    const dueItems: DueItem[] = [
      ...(vax ?? []).map((v): DueItem => ({
        ownerId:  (v.pets as unknown as PetJoin).owner_id,
        petName:  (v.pets as unknown as PetJoin).name,
        label:    'Vaccino',
        itemName: v.vaccine_name,
        dueDate:  v.next_due_at!,
      })),
      ...(anti ?? []).map((a): DueItem => ({
        ownerId:  (a.pets as unknown as PetJoin).owner_id,
        petName:  (a.pets as unknown as PetJoin).name,
        label:    'Antiparassitario',
        itemName: a.product_name,
        dueDate:  a.next_due_at!,
      })),
      ...(rem ?? []).map((r): DueItem => ({
        ownerId:  (r.pets as unknown as PetJoin).owner_id,
        petName:  (r.pets as unknown as PetJoin).name,
        label:    'Promemoria',
        itemName: r.title,
        dueDate:  r.due_date,
      })),
    ]

    if (dueItems.length === 0) {
      return jsonResponse({ sent: 0, message: 'Nessuna scadenza nei prossimi 7 giorni' }, 200)
    }

    // Raggruppa per owner: un utente con 3 scadenze riceve 1 sola notifica
    // riassuntiva invece di 3 push separate.
    const byOwner = new Map<string, DueItem[]>()
    for (const item of dueItems) {
      const list = byOwner.get(item.ownerId) ?? []
      list.push(item)
      byOwner.set(item.ownerId, list)
    }

    let sentCount = 0
    let failedCount = 0
    let staleRemoved = 0

    for (const [ownerId, items] of byOwner) {
      const { data: subs, error: subsErr } = await supabase
        .from('push_subscriptions')
        .select('id, endpoint, keys_p256dh, keys_auth')
        .eq('user_id', ownerId)

      if (subsErr || !subs || subs.length === 0) continue

      const title = items.length === 1
        ? `${items[0]!.label} in scadenza`
        : `${items.length} scadenze in arrivo`

      const body = items.length === 1
        ? `${items[0]!.petName}: ${items[0]!.itemName} entro il ${items[0]!.dueDate}`
        : items.slice(0, 3).map(i => `${i.petName}: ${i.itemName}`).join(' • ')

      const payload = JSON.stringify({ title, body, url: '/app/dashboard', tag: 'petnote-reminder' })

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
            },
            payload
          )
          sentCount++
        } catch (err: unknown) {
          failedCount++
          // 404/410 = subscription scaduta o revocata lato browser — pulizia.
          const statusCode = (err as { statusCode?: number })?.statusCode
          if (statusCode === 404 || statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id)
            staleRemoved++
          } else {
            console.error('Push send failed for subscription', sub.id, err)
          }
        }
      }
    }

    return jsonResponse({
      dueItemsFound: dueItems.length,
      ownersNotified: byOwner.size,
      sent: sentCount,
      failed: failedCount,
      staleSubscriptionsRemoved: staleRemoved,
    }, 200)
  } catch (err) {
    console.error('send-reminders error:', err)
    return jsonResponse({ error: 'Internal error', debug: err instanceof Error ? err.message : String(err) }, 500)
  }
})

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
