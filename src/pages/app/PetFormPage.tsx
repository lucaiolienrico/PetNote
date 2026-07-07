import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { PetForm, type PetFormData } from '@/components/pets/PetForm'
import { usePet, useCreatePet, useUpdatePet } from '@/lib/queries/pets'

// Stringhe vuote del form → null per il DB (constraint UNIQUE microchip, date)
const nn = (v?: string) => (v && v.trim() !== '' ? v.trim() : null)

export function PetFormPage() {
  const { id }   = useParams<{ id: string }>()
  const isEdit   = !!id
  const navigate = useNavigate()

  const { data: pet, isLoading } = usePet(isEdit ? id : undefined)
  const createPet = useCreatePet()
  const updatePet = useUpdatePet()

  const handleSubmit = async (data: PetFormData, photoPath: string | null) => {
    const payload = {
      name:       data.name,
      species:    data.species,
      sex:        data.sex,
      breed:      nn(data.breed),
      birth_date: nn(data.birth_date),
      microchip:  nn(data.microchip),
      notes:      nn(data.notes),
      photo_url:  photoPath,
    }

    try {
      if (isEdit) {
        await updatePet.mutateAsync({ id: id!, ...payload })
        toast.success('Modifiche salvate')
        navigate(`/app/pets/${id}`, { replace: true })
      } else {
        const created = await createPet.mutateAsync(payload)
        toast.success(`${created.name} aggiunto! 🐾`)
        navigate(`/app/pets/${created.id}`, { replace: true })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('pets_microchip_unique')) {
        toast.error('Microchip già registrato su un altro animale')
      } else {
        toast.error('Salvataggio non riuscito. Riprova.')
      }
      throw err
    }
  }

  if (isEdit && isLoading) {
    return <div className="p-4 text-center text-gray-400 text-sm py-16">Caricamento…</div>
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <Link to={isEdit ? `/app/pets/${id}` : '/app/pets'} className="p-1 text-gray-500">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Modifica animale' : 'Nuovo animale'}
        </h1>
      </div>

      <PetForm
        pet={isEdit ? pet : undefined}
        onSubmit={handleSubmit}
        submitting={createPet.isPending || updatePet.isPending}
      />
    </div>
  )
}
