import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Syringe, Stethoscope, Bug, Scale } from 'lucide-react'
import { toast } from 'sonner'
import { usePet, usePetPhotoUrl, useDeletePet } from '@/lib/queries/pets'
import { SPECIES, petAge } from '@/lib/species'

const SECTIONS = [
  { icon: Syringe,     label: 'Vaccinazioni',    hint: 'Passaggio 7-8' },
  { icon: Stethoscope, label: 'Visite',          hint: 'Passaggio 9' },
  { icon: Bug,         label: 'Antiparassitari', hint: 'Passaggio 10' },
  { icon: Scale,       label: 'Peso',            hint: 'Passaggio 11' },
] as const

export function PetDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: pet, isLoading, isError } = usePet(id)
  const { data: photoUrl } = usePetPhotoUrl(pet?.photo_url ?? null)
  const deletePet = useDeletePet()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const onDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    try {
      await deletePet.mutateAsync(id!)
      toast.success('Animale rimosso')
      navigate('/app/pets', { replace: true })
    } catch {
      toast.error('Rimozione non riuscita')
    }
  }

  if (isLoading) return <div className="p-4 text-center text-gray-400 text-sm py-16">Caricamento…</div>
  if (isError || !pet) return (
    <div className="p-4 text-center text-gray-400 text-sm py-16">
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
        <Link to="/app/pets" className="p-1 text-gray-500"><ArrowLeft size={22} /></Link>
        <div className="flex gap-1">
          <Link to={`/app/pets/${pet.id}/edit`} className="p-2 text-gray-500 hover:text-brand-600">
            <Pencil size={18} />
          </Link>
          <button
            onClick={onDelete}
            disabled={deletePet.isPending}
            className={`p-2 transition-colors ${confirmDelete ? 'text-red-600' : 'text-gray-400 hover:text-red-500'}`}
            aria-label={confirmDelete ? 'Conferma rimozione' : 'Rimuovi animale'}
          >
            <Trash2 size={18} />
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
        <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center overflow-hidden">
          {photoUrl
            ? <img src={photoUrl} alt={pet.name} className="w-full h-full object-cover" />
            : <span className="text-4xl">{SPECIES[pet.species].emoji}</span>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        {info.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-500">{k}</span>
            <span className="font-medium text-gray-900">{v}</span>
          </div>
        ))}
      </div>

      {pet.notes && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-500 mb-1">Note</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{pet.notes}</p>
        </div>
      )}

      {/* Sezioni sanitarie — placeholder passaggi 7-11 */}
      <div className="grid grid-cols-2 gap-3">
        {SECTIONS.map(({ icon: Icon, label }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 opacity-60">
            <Icon size={20} className="text-brand-600 mb-2" />
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">In arrivo</p>
          </div>
        ))}
      </div>
    </div>
  )
}
