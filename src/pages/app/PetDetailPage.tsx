import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Settings, Camera, Cpu, Share2,
  Syringe, Stethoscope, Bug, Scale, AlertTriangle, ShieldCheck, Bell, ClipboardList, Pill, FileText,
} from 'lucide-react'
import { usePet, usePetPhotoUrl } from '@/lib/queries/pets'
import { useVaccinations }    from '@/lib/queries/vaccinations'
import { useVetVisits }       from '@/lib/queries/vetVisits'
import { useWeightLogs }      from '@/lib/queries/weightLogs'
import { useAntiparasitics }  from '@/lib/queries/antiparasitics'
import { useAllergies }       from '@/lib/queries/allergies'
import { useInsurancePolicies } from '@/lib/queries/insurance'
import { useHealthEvents }      from '@/lib/queries/healthEvents'
import { useMedications }       from '@/lib/queries/medications'
import { useDocuments }         from '@/lib/queries/documents'
import { useReminders }         from '@/lib/queries/reminders'
import { SPECIES, petAge }    from '@/lib/species'
import { useAuthStore, selectHasFullAccess } from '@/stores/auth.store'
import { ExportPdfButton }    from '@/components/pets/ExportPdfButton'
import { UpgradeModal }       from '@/components/shared/UpgradeModal'
import { ShareLinkModal }     from '@/components/pets/ShareLinkModal'
import { StatCard }           from '@/components/pets/dashboard/StatCard'
import { SectionCard }        from '@/components/pets/dashboard/SectionCard'
import { ActivityTimeline }   from '@/components/pets/dashboard/ActivityTimeline'
import type { ActivityItem }  from '@/components/pets/dashboard/ActivityTimeline'
import { PhotoGallery }       from '@/components/pets/dashboard/PhotoGallery'
import { ReminderBanner }     from '@/components/pets/dashboard/ReminderBanner'
import { SECTION_COLORS }     from '@/components/pets/dashboard/sectionColors'

// Count records per calendar month over the last `months` months.
function monthlyCount(dates: string[], months = 6): number[] {
  const now = new Date()
  const result: number[] = Array<number>(months).fill(0)
  for (const raw of dates) {
    const d = new Date(raw)
    const diff =
      (now.getFullYear() - d.getFullYear()) * 12 +
      (now.getMonth() - d.getMonth())
    if (diff >= 0 && diff < months) {
      result[months - 1 - diff]++
    }
  }
  return result
}

// Timezone-safe parse for date-only strings (e.g. "2024-03-18").
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-')
  return new Date(
    parseInt(parts[0] ?? '2000', 10),
    parseInt(parts[1] ?? '1', 10) - 1,
    parseInt(parts[2] ?? '1', 10),
  )
}

function fmtDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function PetDetailPage() {
  const { id }         = useParams<{ id: string }>()
  const navigate       = useNavigate()
  const hasFullAccess  = useAuthStore(selectHasFullAccess)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showShareLink, setShowShareLink] = useState(false)

  const { data: pet, isLoading, isError }  = usePet(id)
  const { data: photoUrl }                 = usePetPhotoUrl(pet?.photo_url ?? null)
  const { data: vaccinations    = [] }     = useVaccinations(id)
  const { data: vetVisits       = [] }     = useVetVisits(id)
  const { data: weightLogs      = [] }     = useWeightLogs(id)
  const { data: antiparasitics  = [] }     = useAntiparasitics(id)
  const { data: allergies       = [] }     = useAllergies(id)
  const { data: insurancePolicies = [] }   = useInsurancePolicies(id)
  const { data: healthEvents      = [] }   = useHealthEvents(id)
  const { data: medications       = [] }   = useMedications(id)
  const { data: documents         = [] }   = useDocuments(id)
  const { data: reminders         = [] }   = useReminders(id)

  // ── Derived values ──────────────────────────────────────────────────────────

  const latestWeight = weightLogs[0]?.weight_kg ?? null
  const prevWeight   = weightLogs[1]?.weight_kg ?? null

  // Most-recently-administered vaccination/antiparasitic (hooks return
  // next_due_at ASC, so we need to re-find the latest by administered_at).
  const lastVacc = useMemo(
    () => [...vaccinations].sort((a, b) => b.administered_at.localeCompare(a.administered_at))[0],
    [vaccinations],
  )
  const lastAnti = useMemo(
    () => [...antiparasitics].sort((a, b) => b.administered_at.localeCompare(a.administered_at))[0],
    [antiparasitics],
  )
  // Promemoria è prospettico (scadenze future), non storico → ordina ascendente
  // per mostrare il più imminente, non il più recente.
  const nextCustomReminder = useMemo(
    () => [...reminders].sort((a, b) => a.due_date.localeCompare(b.due_date))[0],
    [reminders],
  )

  const activeInsurance = insurancePolicies.find(
    p => !p.end_date || parseLocalDate(p.end_date) >= new Date(),
  )

  // ── Next upcoming reminder (Premium only) ───────────────────────────────────
  const nextReminder = useMemo(() => {
    if (!hasFullAccess) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    type Candidate = { label: string; sublabel: string; dueDate: Date }
    const candidates: Candidate[] = []

    for (const v of vaccinations) {
      if (!v.next_due_at) continue
      const due = parseLocalDate(v.next_due_at)
      if (due >= today) candidates.push({ label: v.vaccine_name, sublabel: 'Vaccinazione', dueDate: due })
    }
    for (const a of antiparasitics) {
      if (!a.next_due_at) continue
      const due = parseLocalDate(a.next_due_at)
      if (due >= today) candidates.push({ label: a.product_name, sublabel: 'Antiparassitario', dueDate: due })
    }
    for (const r of reminders) {
      const due = parseLocalDate(r.due_date)
      if (due >= today) candidates.push({ label: r.title, sublabel: 'Promemoria', dueDate: due })
    }

    if (!candidates.length) return null
    candidates.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    const first = candidates[0]!
    const daysUntil = Math.max(0, Math.ceil(
      (first.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    ))
    return { label: first.label, sublabel: first.sublabel, daysUntil }
  }, [hasFullAccess, vaccinations, antiparasitics, reminders])

  // Count of reminders due within 30 days (Premium only).
  const reminderCount = useMemo(() => {
    if (!hasFullAccess) return 0
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const in30  = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    let n = 0
    for (const v of vaccinations) {
      if (v.next_due_at) { const d = parseLocalDate(v.next_due_at); if (d >= today && d <= in30) n++ }
    }
    for (const a of antiparasitics) {
      if (a.next_due_at) { const d = parseLocalDate(a.next_due_at); if (d >= today && d <= in30) n++ }
    }
    for (const r of reminders) {
      const d = parseLocalDate(r.due_date); if (d >= today && d <= in30) n++
    }
    return n
  }, [hasFullAccess, vaccinations, antiparasitics, reminders])

  // ── Activity timeline ───────────────────────────────────────────────────────
  const recentActivity = useMemo((): ActivityItem[] => {
    const items: ActivityItem[] = []

    for (const v of vaccinations) {
      items.push({ key: `vacc-${v.id}`, section: 'vaccinations', title: v.vaccine_name,
        subtitle: v.veterinarian ?? 'Vaccinazione', date: v.administered_at })
    }
    for (const v of vetVisits) {
      items.push({ key: `vet-${v.id}`, section: 'vet-visits', title: v.reason,
        subtitle: v.clinic ?? v.veterinarian ?? 'Visita veterinaria', date: v.visited_at })
    }
    for (const w of weightLogs) {
      items.push({ key: `weight-${w.id}`, section: 'weight', title: `${w.weight_kg} kg`,
        subtitle: 'Peso registrato', date: w.measured_at })
    }
    for (const a of antiparasitics) {
      items.push({ key: `anti-${a.id}`, section: 'antiparasitics', title: a.product_name,
        subtitle: a.type, date: a.administered_at })
    }
    for (const a of allergies) {
      items.push({ key: `allergy-${a.id}`, section: 'allergies', title: a.allergen,
        subtitle: a.severity, date: a.diagnosed_at ?? a.created_at })
    }
    for (const p of insurancePolicies) {
      items.push({ key: `ins-${p.id}`, section: 'insurance', title: p.provider,
        subtitle: p.policy_number ? `N° ${p.policy_number}` : 'Assicurazione', date: p.start_date })
    }
    for (const h of healthEvents) {
      items.push({ key: `health-${h.id}`, section: 'health-events', title: h.event_type,
        subtitle: h.description ? h.description.slice(0, 60) : 'Evento sanitario', date: h.occurred_at })
    }
    for (const m of medications) {
      items.push({ key: `med-${m.id}`, section: 'medications', title: m.drug_name,
        subtitle: [m.dosage, m.frequency].filter(Boolean).join(' · ') || 'Terapia', date: m.start_date })
    }
    for (const d of documents) {
      items.push({ key: `doc-${d.id}`, section: 'documents', title: d.title,
        subtitle: d.document_type, date: d.uploaded_at })
    }

    return items
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
  }, [vaccinations, vetVisits, weightLogs, antiparasitics, allergies, insurancePolicies, healthEvents, medications, documents])

  // ── Sparklines ──────────────────────────────────────────────────────────────
  const vaccSparkData  = monthlyCount(vaccinations.map(v => v.administered_at))
  const visitSparkData = monthlyCount(vetVisits.map(v => v.visited_at))
  const weightSparkData = [...weightLogs].reverse().map(w => Number(w.weight_kg))

  // ── Render guards ───────────────────────────────────────────────────────────
  if (isLoading) {
    return <div className="p-4 text-center text-slate-500 text-sm py-16">Caricamento…</div>
  }
  if (isError || !pet) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm py-16">
        Animale non trovato.{' '}
        <Link to="/app/pets" className="text-brand-600 font-medium">Torna alla lista</Link>
      </div>
    )
  }

  const species = SPECIES[pet.species]
  const age     = petAge(pet.birth_date)

  const subtitleParts = [
    pet.breed,
    pet.sex !== 'non_specificato'
      ? (pet.sex === 'maschio' ? 'Maschio' : 'Femmina')
      : null,
  ].filter((x): x is string => x !== null)

  const metaParts = [
    age,
    latestWeight !== null ? `${latestWeight} kg` : null,
  ].filter((x): x is string => x !== null)

  const weightSublabel = prevWeight !== null
    ? `Prec. ${prevWeight} kg`
    : latestWeight !== null ? 'Prima rilevazione' : 'Nessun dato'

  return (
    <div className="pb-28">

      {/* ── HEADER ── */}
      <div className="relative bg-gradient-to-b from-blue-50 to-slate-50 px-4 pt-4 pb-6">
        {/* Nav row */}
        <div className="flex items-center justify-between mb-5">
          <Link
            to="/app/pets"
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:bg-slate-50 transition-colors"
            aria-label="Torna alla lista animali"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (hasFullAccess ? setShowShareLink(true) : setShowUpgrade(true))}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:bg-slate-50 transition-colors"
              aria-label="Condividi scheda sanitaria"
            >
              <Share2 size={19} className="text-slate-700" />
            </button>
            <Link
              to={`/app/pets/${pet.id}/edit`}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:bg-slate-50 transition-colors"
              aria-label="Modifica animale"
            >
              <Settings size={20} className="text-slate-700" />
            </Link>
          </div>
        </div>

        {/* Photo + info row */}
        <div className="flex items-start gap-4">
          {/* Photo with ring + camera button */}
          <div className="relative flex-shrink-0">
            <div className="w-[140px] h-[140px] rounded-full border-4 border-blue-400 overflow-hidden bg-blue-50 flex items-center justify-center">
              {photoUrl
                ? <img src={photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                : <span className="text-5xl select-none">{species.emoji}</span>
              }
            </div>
            <button
              type="button"
              onClick={() => navigate(`/app/pets/${pet.id}/edit`)}
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shadow-md active:bg-blue-700 transition-colors"
              aria-label="Cambia foto animale"
            >
              <Camera size={16} className="text-white" />
            </button>
          </div>

          {/* Name, species badge, subtitle, microchip */}
          <div className="flex-1 min-w-0 pt-1">
            <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
              {species.emoji} {species.label}
            </span>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              {pet.name}
            </h1>
            {subtitleParts.length > 0 && (
              <p className="text-sm text-slate-500 mt-1">{subtitleParts.join(' • ')}</p>
            )}
            {metaParts.length > 0 && (
              <p className="text-sm text-slate-500">{metaParts.join(' • ')}</p>
            )}
            {pet.microchip && (
              <div className="inline-flex items-center gap-1.5 mt-2 border border-slate-200 bg-white rounded-full px-3 py-1">
                <Cpu size={11} className="text-slate-500" />
                <span className="font-mono text-[11px] text-slate-600 tracking-tight">
                  {pet.microchip}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">

        {/* ── REMINDER BANNER ── */}
        {nextReminder && (
          <ReminderBanner
            label={nextReminder.label}
            sublabel={nextReminder.sublabel}
            daysUntil={nextReminder.daysUntil}
          />
        )}

        {/* ── STAT CARDS — 2×2 mobile / 4×1 desktop ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Vaccinazioni"
            value={vaccinations.length}
            sublabel="registrate"
            icon={Syringe}
            iconBg={SECTION_COLORS.vaccinations.iconBg}
            iconText={SECTION_COLORS.vaccinations.iconText}
            sparkData={vaccSparkData}
            sparkHex={SECTION_COLORS.vaccinations.sparkHex}
            locked={!hasFullAccess}
            to={`/app/pets/${pet.id}/vaccinations`}
            onLockClick={() => setShowUpgrade(true)}
          />
          <StatCard
            label="Visite"
            value={vetVisits.length}
            sublabel="effettuate"
            icon={Stethoscope}
            iconBg={SECTION_COLORS['vet-visits'].iconBg}
            iconText={SECTION_COLORS['vet-visits'].iconText}
            sparkData={visitSparkData}
            sparkHex={SECTION_COLORS['vet-visits'].sparkHex}
            to={`/app/pets/${pet.id}/vet-visits`}
          />
          <StatCard
            label="Peso attuale"
            value={latestWeight !== null ? `${latestWeight} kg` : '—'}
            sublabel={weightSublabel}
            icon={Scale}
            iconBg={SECTION_COLORS.weight.iconBg}
            iconText={SECTION_COLORS.weight.iconText}
            sparkData={weightSparkData}
            sparkHex={SECTION_COLORS.weight.sparkHex}
            locked={!hasFullAccess}
            to={`/app/pets/${pet.id}/weight`}
            onLockClick={() => setShowUpgrade(true)}
          />
          <StatCard
            label="Promemoria"
            value={reminderCount}
            sublabel="nei prossimi 30 gg"
            icon={Bell}
            iconBg="bg-amber-100"
            iconText="text-amber-600"
            sparkData={[]}
            sparkHex="#d97706"
            locked={!hasFullAccess}
            to={`/app/pets/${pet.id}/reminders`}
            onLockClick={() => setShowUpgrade(true)}
          />
        </div>

        {/* ── SECTION CARDS — 2 cols mobile / 3 cols desktop ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <SectionCard
            petId={pet.id}
            path="vaccinations"
            label="Vaccinazioni"
            icon={Syringe}
            iconBg={SECTION_COLORS.vaccinations.iconBg}
            iconText={SECTION_COLORS.vaccinations.iconText}
            count={`${vaccinations.length} registrate`}
            lastLabel={lastVacc ? `Ultima: ${fmtDate(lastVacc.administered_at)}` : undefined}
            locked={!hasFullAccess}
            onLockClick={() => setShowUpgrade(true)}
          />
          <SectionCard
            petId={pet.id}
            path="vet-visits"
            label="Visite"
            icon={Stethoscope}
            iconBg={SECTION_COLORS['vet-visits'].iconBg}
            iconText={SECTION_COLORS['vet-visits'].iconText}
            count={`${vetVisits.length} ${vetVisits.length === 1 ? 'visita' : 'visite'}`}
            lastLabel={vetVisits[0] ? `Ultima: ${fmtDate(vetVisits[0].visited_at)}` : undefined}
            locked={false}
            onLockClick={() => setShowUpgrade(true)}
          />
          <SectionCard
            petId={pet.id}
            path="weight"
            label="Peso"
            icon={Scale}
            iconBg={SECTION_COLORS.weight.iconBg}
            iconText={SECTION_COLORS.weight.iconText}
            count={latestWeight !== null ? `${latestWeight} kg` : '—'}
            lastLabel={weightLogs[0] ? `Aggiornato: ${fmtDate(weightLogs[0].measured_at)}` : undefined}
            locked={!hasFullAccess}
            onLockClick={() => setShowUpgrade(true)}
          />
          <SectionCard
            petId={pet.id}
            path="antiparasitics"
            label="Antiparassitari"
            icon={Bug}
            iconBg={SECTION_COLORS.antiparasitics.iconBg}
            iconText={SECTION_COLORS.antiparasitics.iconText}
            count={antiparasitics.length > 0 ? 'Protezione attiva' : 'Nessun record'}
            lastLabel={lastAnti ? `Ultimo: ${fmtDate(lastAnti.administered_at)}` : undefined}
            locked={!hasFullAccess}
            onLockClick={() => setShowUpgrade(true)}
          />
          <SectionCard
            petId={pet.id}
            path="allergies"
            label="Allergie"
            icon={AlertTriangle}
            iconBg={SECTION_COLORS.allergies.iconBg}
            iconText={SECTION_COLORS.allergies.iconText}
            count={
              allergies.length > 0
                ? `${allergies.length} ${allergies.length === 1 ? 'nota' : 'note'}`
                : 'Nessuna nota'
            }
            lastLabel={
              allergies[0]
                ? `Ultima: ${fmtDate(allergies[0].diagnosed_at ?? allergies[0].created_at)}`
                : undefined
            }
            locked={false}
            onLockClick={() => setShowUpgrade(true)}
          />
          <SectionCard
            petId={pet.id}
            path="insurance"
            label="Assicurazioni"
            icon={ShieldCheck}
            iconBg={SECTION_COLORS.insurance.iconBg}
            iconText={SECTION_COLORS.insurance.iconText}
            count={
              activeInsurance
                ? 'Polizza attiva'
                : insurancePolicies.length > 0 ? 'Scaduta' : 'Nessuna polizza'
            }
            lastLabel={insurancePolicies[0] ? `Dal: ${fmtDate(insurancePolicies[0].start_date)}` : undefined}
            locked={!hasFullAccess}
            onLockClick={() => setShowUpgrade(true)}
          />
          <SectionCard
            petId={pet.id}
            path="health-events"
            label="Diario sanitario"
            icon={ClipboardList}
            iconBg={SECTION_COLORS['health-events'].iconBg}
            iconText={SECTION_COLORS['health-events'].iconText}
            count={
              healthEvents.length > 0
                ? `${healthEvents.length} ${healthEvents.length === 1 ? 'evento' : 'eventi'}`
                : 'Nessun evento'
            }
            lastLabel={healthEvents[0] ? `Ultimo: ${fmtDate(healthEvents[0].occurred_at)}` : undefined}
            locked={false}
            onLockClick={() => setShowUpgrade(true)}
          />
          <SectionCard
            petId={pet.id}
            path="medications"
            label="Farmaci"
            icon={Pill}
            iconBg={SECTION_COLORS.medications.iconBg}
            iconText={SECTION_COLORS.medications.iconText}
            count={
              medications.length > 0
                ? `${medications.length} ${medications.length === 1 ? 'terapia' : 'terapie'}`
                : 'Nessuna terapia'
            }
            lastLabel={medications[0] ? `Ultima: ${fmtDate(medications[0].start_date)}` : undefined}
            locked={!hasFullAccess}
            onLockClick={() => setShowUpgrade(true)}
          />
          <SectionCard
            petId={pet.id}
            path="documents"
            label="Documenti"
            icon={FileText}
            iconBg={SECTION_COLORS.documents.iconBg}
            iconText={SECTION_COLORS.documents.iconText}
            count={
              documents.length > 0
                ? `${documents.length} ${documents.length === 1 ? 'documento' : 'documenti'}`
                : 'Nessun documento'
            }
            lastLabel={documents[0] ? `Caricato: ${fmtDate(documents[0].uploaded_at)}` : undefined}
            locked={!hasFullAccess}
            onLockClick={() => setShowUpgrade(true)}
          />
          <SectionCard
            petId={pet.id}
            path="reminders"
            label="Promemoria"
            icon={Bell}
            iconBg={SECTION_COLORS.reminders.iconBg}
            iconText={SECTION_COLORS.reminders.iconText}
            count={reminders.length > 0 ? `${reminders.length} promemoria` : 'Nessun promemoria'}
            lastLabel={nextCustomReminder ? `Prossimo: ${fmtDate(nextCustomReminder.due_date)}` : undefined}
            locked={!hasFullAccess}
            onLockClick={() => setShowUpgrade(true)}
          />
        </div>

        {/* ── ACTIVITY TIMELINE + PHOTO GALLERY ── */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Timeline — 60% on desktop */}
          <div className="sm:flex-[3] min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/40 p-4">
            <p className="text-sm font-semibold text-slate-900 mb-4">Attività recenti</p>
            <ActivityTimeline items={recentActivity} />
          </div>

          {/* Gallery — 40% on desktop */}
          <div className="sm:flex-[2] bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/40 p-4">
            <PhotoGallery
              petId={pet.id}
              petName={pet.name}
              photoUrl={photoUrl}
            />
          </div>
        </div>

        {/* ── CTA PDF BUTTON — sticky in-flow, sopra la bottom nav ── */}
        {/* Non più `fixed` overlay: `sticky` resta nel flusso del documento,
            quindi (a) non copre mai il contenuto della pagina (occupa spazio
            proprio) e (b) ha z-10 < z-50 dei modal, che sono renderizzati in
            portal su document.body — nessuna guardia di stato necessaria,
            nessuna dipendenza da quale componente (pagina o BottomNav) apre
            il modal, nessun rischio da bundle PWA stale con stacking diverso. */}
        <div className="sticky bottom-20 z-10">
          <ExportPdfButton pet={pet} variant="cta" />
        </div>
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <ShareLinkModal
        petId={pet.id}
        petName={pet.name}
        open={showShareLink}
        onClose={() => setShowShareLink(false)}
      />
    </div>
  )
}
