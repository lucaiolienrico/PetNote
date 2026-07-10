import { useParams } from 'react-router-dom'
import {
  PawPrint, Syringe, Stethoscope, Bug, Scale, AlertTriangle, Pill, ClipboardList,
  AlertCircle,
} from 'lucide-react'
import { useSharedPetData } from '@/lib/queries/sharedPet'
import { SPECIES, petAge } from '@/lib/species'
import { formatIt } from '@/lib/health'

const TYPE_LABEL: Record<string, string> = {
  interno: 'Interno', esterno: 'Esterno', entrambi: 'Interno + Esterno',
}
const SEVERITY_LABEL: Record<string, string> = {
  lieve: 'Lieve', moderata: 'Moderata', grave: 'Grave',
}

function Section({
  icon: Icon, iconBg, iconText, title, count, children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconBg: string; iconText: string; title: string; count: number
  children: React.ReactNode
}) {
  if (count === 0) return null
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/40 p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={15} className={iconText} />
        </div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <span className="text-xs text-slate-400">({count})</span>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

const rowCls = 'border-t border-slate-50 pt-2.5 first:border-t-0 first:pt-0'

export function SharedPetPage() {
  const { token } = useParams<{ token: string }>()
  const { data: result, isLoading } = useSharedPetData(token)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (result?.error || !result?.data) {
    const message = result?.error === 'expired'
      ? 'Questo link di condivisione è scaduto.'
      : result?.error === 'not_found'
        ? 'Link non valido o rimosso dal proprietario.'
        : 'Impossibile caricare la scheda. Riprova più tardi.'
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-3 max-w-sm">
          <AlertCircle size={32} className="text-slate-300 mx-auto" />
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </div>
    )
  }

  const { pet, vaccinations, vetVisits, antiparasitics, weightLogs, allergies, medications, healthEvents } = result.data
  const species = SPECIES[pet.species as keyof typeof SPECIES] ?? SPECIES.altro
  const age     = petAge(pet.birth_date)
  const latestWeight = weightLogs[0]?.weight_kg ?? null

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-gradient-to-b from-blue-50 to-slate-50 px-4 pt-8 pb-6">
        <div className="flex items-center gap-2 justify-center mb-4 text-xs text-slate-400">
          <PawPrint size={14} /> Scheda sanitaria condivisa · sola lettura
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-24 h-24 rounded-full border-4 border-blue-400 overflow-hidden bg-blue-50 flex items-center justify-center">
            {pet.photo_url
              ? <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
              : <span className="text-4xl select-none">{species.emoji}</span>}
          </div>
          <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {species.emoji} {species.label}
          </span>
          <h1 className="text-2xl font-bold text-slate-900">{pet.name}</h1>
          <p className="text-sm text-slate-500">
            {[pet.breed, age, latestWeight !== null ? `${latestWeight} kg` : null].filter(Boolean).join(' • ')}
          </p>
          {pet.microchip && (
            <p className="font-mono text-[11px] text-slate-400">Microchip: {pet.microchip}</p>
          )}
        </div>
      </div>

      <div className="px-4 space-y-3 mt-2 max-w-lg mx-auto">
        <Section icon={Syringe} iconBg="bg-blue-100" iconText="text-blue-600" title="Vaccinazioni" count={vaccinations.length}>
          {vaccinations.map(v => (
            <div key={v.id} className={rowCls}>
              <p className="text-sm font-medium text-slate-800">{v.vaccine_name}</p>
              <p className="text-xs text-slate-500">
                {formatIt(v.administered_at)}{v.veterinarian && ` · ${v.veterinarian}`}
                {v.next_due_at && ` · prossima: ${formatIt(v.next_due_at)}`}
              </p>
            </div>
          ))}
        </Section>

        <Section icon={Stethoscope} iconBg="bg-green-100" iconText="text-green-600" title="Visite veterinarie" count={vetVisits.length}>
          {vetVisits.map(v => (
            <div key={v.id} className={rowCls}>
              <p className="text-sm font-medium text-slate-800">{v.reason}</p>
              <p className="text-xs text-slate-500">
                {formatIt(v.visited_at)}{v.clinic && ` · ${v.clinic}`}
              </p>
              {v.diagnosis && <p className="text-xs text-slate-400 mt-0.5">{v.diagnosis}</p>}
            </div>
          ))}
        </Section>

        <Section icon={Bug} iconBg="bg-amber-100" iconText="text-amber-600" title="Antiparassitari" count={antiparasitics.length}>
          {antiparasitics.map(a => (
            <div key={a.id} className={rowCls}>
              <p className="text-sm font-medium text-slate-800">{a.product_name}</p>
              <p className="text-xs text-slate-500">
                {TYPE_LABEL[a.type] ?? a.type} · {formatIt(a.administered_at)}
                {a.next_due_at && ` · prossimo: ${formatIt(a.next_due_at)}`}
              </p>
            </div>
          ))}
        </Section>

        <Section icon={Scale} iconBg="bg-violet-100" iconText="text-violet-600" title="Peso" count={weightLogs.length}>
          {weightLogs.slice(0, 10).map(w => (
            <div key={w.id} className={`${rowCls} flex justify-between`}>
              <span className="text-sm font-medium text-slate-800">{w.weight_kg} kg</span>
              <span className="text-xs text-slate-500">{formatIt(w.measured_at)}</span>
            </div>
          ))}
        </Section>

        <Section icon={AlertTriangle} iconBg="bg-red-100" iconText="text-red-600" title="Allergie" count={allergies.length}>
          {allergies.map(a => (
            <div key={a.id} className={rowCls}>
              <p className="text-sm font-medium text-slate-800">
                {a.allergen} <span className="text-xs font-normal text-slate-400">— {SEVERITY_LABEL[a.severity] ?? a.severity}</span>
              </p>
              {a.reaction && <p className="text-xs text-slate-500 mt-0.5">{a.reaction}</p>}
            </div>
          ))}
        </Section>

        <Section icon={Pill} iconBg="bg-indigo-100" iconText="text-indigo-600" title="Farmaci" count={medications.length}>
          {medications.map(m => (
            <div key={m.id} className={rowCls}>
              <p className="text-sm font-medium text-slate-800">{m.drug_name}</p>
              <p className="text-xs text-slate-500">
                {[m.dosage, m.frequency].filter(Boolean).join(' · ') || 'Dettagli non specificati'}
                {' · dal '}{formatIt(m.start_date)}{m.end_date && ` al ${formatIt(m.end_date)}`}
              </p>
            </div>
          ))}
        </Section>

        <Section icon={ClipboardList} iconBg="bg-orange-100" iconText="text-orange-600" title="Diario sanitario" count={healthEvents.length}>
          {healthEvents.map(h => (
            <div key={h.id} className={rowCls}>
              <p className="text-sm font-medium text-slate-800">{h.event_type}</p>
              <p className="text-xs text-slate-500">
                {formatIt(h.occurred_at)}{h.description && ` · ${h.description}`}
              </p>
            </div>
          ))}
        </Section>
      </div>

      <p className="text-center text-xs text-slate-300 mt-8">Generato con PetNote</p>
    </div>
  )
}
