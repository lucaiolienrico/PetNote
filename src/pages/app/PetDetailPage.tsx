import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Syringe, Stethoscope, Bug, Scale, AlertTriangle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { usePet, usePetPhotoUrl, useDeletePet } from '@/lib/queries/pets'
import { SPECIES, petAge } from '@/lib/species'
import { useConfirmTap } from '@/hooks/useConfirmTap'
import { ExportPdfButton } from '@/components/pets/ExportPdfButton'

const SECTIONS = [
  { icon: Syringe,       label: 'Vaccinazioni',    path: 'vaccinations',   ready: true },
  { icon: Stethoscope,   label: 'Visite',          path: 'vet-visits',     ready: true },
  { icon: Bug,           label: 'Antiparassitari', path: 'antiparasitics', ready: true },
  { icon: Scale,         label: 'Peso',            path: 'weight',         ready: true },
  { icon: AlertTriangle, label: 'Allergie',        path: 'allergies',      ready: true },
  { icon: ShieldCheck,   label: 'Assicurazioni',   path: 'insurance',      ready: true },
] as const

export function PetDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: pet, isLoading, isError } = usePet(id)
  const { data: photoUrl } = usePetPhotoUrl(pet?.photo_url ?? null)
  const deletePet = useDeletePet()
  const { tap, isArmed } = useConfirmTap()
  const confirmDelete = isArmed('delete')

  const onDelete = () => tap('delete', async () => {
    try {
      await deletePet.mutateAsync(id!)
      toast.success('Animale rimosso')
      navigate('/app/pets', { replace: true })
    } catch {
      toast.error('Rimozione non riuscita')
    }
  })

  if (isLoading) return <div className="p-4 text-center text-slate-500 text-sm py-16">Caricamento…</div>
  if (isError || !pet) return (
    <div className="p-4 text-center text-slate-500 text-sm py-16">
      Animale non trovato. <Link to="/app/pets" className="text-brand-600 font-medium">Torna alla lista</Link>
    </div>
  )

  const info: Array<[string, string | null]> = [
    ['Specie',    SPECIES[pet.species].label],
    ['Razza',     pet.breed],
    ['Sesso',     pet.sex === 'non_specificato' ? null : pet.sex === 'maschio' ? 'Maschio' : 'Femmina'],
    ['Età',       petAge(pet.birth_date)],
    ['Microchip', pet.microchip],
  ]

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        {/* -ml-2.5: compensa il padding del tap target (2.5) per allineare
            otticamente l'icona al bordo pagina, invariato per l'utente. */}
        <Link
          to="/app/pets"
          className="-ml-2.5 p-2.5 rounded-full text-slate-900 hover:text-brand-600 active:bg-slate-100 transition-colors"
          aria-label="Torna alla lista animali"
        >
          <ArrowLeft size={22} />
        </Link>
        {/* -mr-2.5: stesso principio, allinea l'ultima icona (Trash2) al bordo destro. */}
        <div className="flex items-center gap-1 -mr-2.5">
          <ExportPdfButton pet={pet} />
          <Link
            to={`/app/pets/${pet.id}/edit`}
            className="p-2.5 rounded-full text-slate-500 hover:text-brand-600 active:bg-slate-100 transition-colors"
            aria-label="Modifica animale"
          >
            <Pencil size={20} />
          </Link>
          <button
            onClick={onDelete}
            disabled={deletePet.isPending}
            className={`p-2.5 rounded-full transition-colors ${confirmDelete ? 'text-red-600 bg-red-50' : 'text-slate-500 hover:text-red-600 active:bg-slate-100'}`}
            aria-label={confirmDelete ? 'Conferma rimozione' : 'Rimuovi animale'}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {confirmDelete && (
        <p className="text-center text-xs text-red-600 font-medium -mt-2">
          Tocca di nuovo il cestino per confermare
        </p>
      )}

      {/* Header profilo */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-24 h-24 rounded-full bg-brand-50 ring-1 ring-brand-100 flex items-center justify-center overflow-hidden">
          {photoUrl
            ? <img src={photoUrl} alt={pet.name} className="w-full h-full object-cover" />
            : <span className="text-4xl">{SPECIES[pet.species].emoji}</span>}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{pet.name}</h1>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-sm shadow-slate-200/40">
        {info.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 px-4 py-3.5 text-sm">
            <span className="shrink-0 text-slate-500">{k}</span>
            {/* Microchip: stringa numerica lunga → font leggermente ridotto,
                tabular-nums per allineamento cifre, break-all come rete di
                sicurezza sui viewport più stretti (<360px). */}
            <span
              className={
                k === 'Microchip'
                  ? 'text-right text-[13px] font-semibold tabular-nums tracking-tight text-slate-900 break-all'
                  : 'text-right font-semibold text-slate-900'
              }
            >
              {v}
            </span>
          </div>
        ))}
      </div>

      {pet.notes && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Note</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{pet.notes}</p>
        </div>
      )}

      {/* Sezioni sanitarie — MVP (vaccinazioni/visite/antiparassitari/peso) + Allergie/Assicurazioni */}
      <div className="grid grid-cols-2 gap-3">
        {SECTIONS.map(({ icon: Icon, label, path, ready }) =>
          ready ? (
            <Link
              key={label}
              to={`/app/pets/${pet.id}/${path}`}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/40 p-4 active:bg-slate-50 transition-colors"
            >
              <Icon size={22} className="text-brand-600 mb-2" />
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">Vedi tutte</p>
            </Link>
          ) : (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 opacity-60">
              <Icon size={22} className="text-brand-600 mb-2" />
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">In arrivo</p>
            </div>
          ),
        )}
      </div>

      {/* Report PDF completo — CTA piena larghezza, sotto la sezione Allergie.
          Riusa la stessa logica di ExportPdfButton (variant='cta'): nessuna
          duplicazione della generazione PDF già presente in header. */}
      <ExportPdfButton pet={pet} variant="cta" />
    </div>
  )
}
