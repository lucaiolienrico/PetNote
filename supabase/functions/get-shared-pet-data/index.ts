// get-shared-pet-data
// Chiamata pubblica e anonima dalla pagina /shared/:token — nessuna sessione
// Supabase coinvolta, per questo verify_jwt=false a deploy. L'unico controllo
// d'accesso è il token stesso: deve esistere in share_links e non essere
// scaduto. Usiamo service_role per bypassare le RLS ownership-based (un
// visitatore anonimo non è owner di nulla), MA restituiamo solo un
// sottoinsieme scelto di colonne/tabelle — mai owner_id, mai documents
// (storage privato, fuori scope), mai insurance_policies (dati finanziari,
// irrilevanti per un veterinario che consulta lo storico sanitario).
//
// Errori "attesi" (token inesistente/scaduto) tornano con status 200 e un
// body { error: '...' }, non 404/410 — evita ambiguità con FunctionsHttpError
// lato client supabase-js, che tratta diversamente il transport error dal
// body applicativo. Solo un fallimento realmente imprevisto usa status 500.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'method_not_allowed' }, 405)
    }

    let token: unknown
    try {
      const body = await req.json()
      token = body?.token
    } catch {
      return jsonResponse({ error: 'not_found' }, 200)
    }
    if (typeof token !== 'string' || token.length === 0) {
      return jsonResponse({ error: 'not_found' }, 200)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: link, error: linkError } = await admin
      .from('share_links')
      .select('pet_id, expires_at')
      .eq('token', token)
      .maybeSingle()

    if (linkError) {
      console.error('get-shared-pet-data: lookup share_links failed:', linkError)
      return jsonResponse({ error: 'unknown' }, 500)
    }
    if (!link) {
      return jsonResponse({ error: 'not_found' }, 200)
    }
    if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
      return jsonResponse({ error: 'expired' }, 200)
    }

    const petId = link.pet_id

    const { data: pet, error: petError } = await admin
      .from('pets')
      .select('id, name, species, breed, sex, birth_date, microchip, photo_url')
      .eq('id', petId)
      .single()

    if (petError || !pet) {
      // ON DELETE CASCADE su pets→share_links rende questo caso teorico,
      // ma non assumiamo mai l'integrità referenziale in un endpoint pubblico.
      console.error('get-shared-pet-data: pet not found for valid link:', petError)
      return jsonResponse({ error: 'not_found' }, 200)
    }

    let photoUrl: string | null = null
    if (pet.photo_url) {
      const { data: signed } = await admin.storage
        .from('pet-photos')
        .createSignedUrl(pet.photo_url, 3600)
      photoUrl = signed?.signedUrl ?? null
    }

    const [
      { data: vaccinations },
      { data: vetVisits },
      { data: antiparasitics },
      { data: weightLogs },
      { data: allergies },
      { data: medications },
      { data: healthEvents },
    ] = await Promise.all([
      admin.from('vaccinations')
        .select('id, vaccine_name, administered_at, veterinarian, next_due_at, notes')
        .eq('pet_id', petId)
        .order('administered_at', { ascending: false }),
      admin.from('vet_visits')
        .select('id, visited_at, clinic, veterinarian, reason, diagnosis')
        .eq('pet_id', petId)
        .order('visited_at', { ascending: false }),
      admin.from('antiparasitics')
        .select('id, product_name, type, administered_at, next_due_at')
        .eq('pet_id', petId)
        .order('administered_at', { ascending: false }),
      admin.from('weight_logs')
        .select('id, weight_kg, measured_at')
        .eq('pet_id', petId)
        .order('measured_at', { ascending: false }),
      admin.from('allergies')
        .select('id, allergen, severity, reaction, diagnosed_at')
        .eq('pet_id', petId)
        .order('diagnosed_at', { ascending: false }),
      admin.from('medications')
        .select('id, drug_name, dosage, frequency, start_date, end_date')
        .eq('pet_id', petId)
        .order('start_date', { ascending: false }),
      admin.from('health_events')
        .select('id, event_type, occurred_at, description')
        .eq('pet_id', petId)
        .order('occurred_at', { ascending: false }),
    ])

    return jsonResponse({
      pet: { ...pet, photo_url: photoUrl },
      vaccinations:   vaccinations   ?? [],
      vetVisits:      vetVisits      ?? [],
      antiparasitics: antiparasitics ?? [],
      weightLogs:     weightLogs     ?? [],
      allergies:      allergies      ?? [],
      medications:    medications    ?? [],
      healthEvents:   healthEvents   ?? [],
    }, 200)
  } catch (err) {
    console.error('get-shared-pet-data error:', err)
    return jsonResponse({ error: 'unknown' }, 500)
  }
})

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
