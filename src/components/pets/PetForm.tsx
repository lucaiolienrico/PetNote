import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'
import { SPECIES_OPTIONS } from '@/lib/species'
import { uploadPetPhoto, usePetPhotoUrl, type Pet } from '@/lib/queries/pets'

const today = () => new Date().toISOString().slice(0, 10)

const schema = z.object({
  name:       z.string().trim().min(1, 'Nome obbligatorio').max(60, 'Massimo 60 caratteri'),
  species:    z.enum(['cane', 'gatto', 'coniglio', 'uccello', 'rettile', 'altro']),
  breed:      z.string().trim().max(80).optional(),
  sex:        z.enum(['maschio', 'femmina', 'non_specificato']),
  birth_date: z.string().optional()
                .refine(v => !v || v <= today(), 'Data futura non valida'),
  microchip:  z.string().trim().max(30).optional(),
  notes:      z.string().trim().max(1000).optional(),
})
export type PetFormData = z.infer<typeof schema>

interface Props {
  pet?:      Pet
  onSubmit:  (data: PetFormData, photoPath: string | null) => Promise<void>
  submitting: boolean
}

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // limite bucket pet-photos

export function PetForm({ pet, onSubmit, submitting }: Props) {
  const [photoFile, setPhotoFile]       = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading]       = useState(false)
  const { data: existingPhotoUrl } = usePetPhotoUrl(pet?.photo_url ?? null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PetFormData>({
    resolver: zodResolver(schema),
    defaultValues: pet ? {
      name:       pet.name,
      species:    pet.species,
      breed:      pet.breed ?? '',
      sex:        pet.sex,
      birth_date: pet.birth_date ?? '',
      microchip:  pet.microchip ?? '',
      notes:      pet.notes ?? '',
    } : { species: 'cane', sex: 'non_specificato' },
  })
  const species = watch('species')

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('Foto troppo grande (max 5 MB)')
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const submit = async (data: PetFormData) => {
    try {
      let photoPath: string | null = pet?.photo_url ?? null
      if (photoFile) {
        setUploading(true)
        photoPath = await uploadPetPhoto(photoFile)
      }
      await onSubmit(data, photoPath)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore imprevisto')
    } finally {
      setUploading(false)
    }
  }

  const busy    = submitting || uploading
  const preview = photoPreview ?? existingPhotoUrl
  const emoji   = SPECIES_OPTIONS.find(o => o.value === species)?.emoji ?? '🐾'

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {/* Foto */}
      <div className="flex justify-center">
        <label className="relative w-24 h-24 rounded-full bg-brand-50 border-2 border-dashed border-brand-200 flex items-center justify-center cursor-pointer overflow-hidden">
          {preview
            ? <img src={preview} alt="Foto animale" className="w-full h-full object-cover" />
            : <span className="text-3xl">{emoji}</span>}
          <span className="absolute bottom-0 inset-x-0 bg-black/40 py-1 flex justify-center">
            <Camera size={14} className="text-white" />
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPhotoChange} />
        </label>
      </div>

      <div>
        <label className={labelCls}>Nome *</label>
        <input {...register('name')} placeholder="Es. Luna" className={inputCls} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Specie *</label>
          <select {...register('species')} className={inputCls}>
            {SPECIES_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sesso</label>
          <select {...register('sex')} className={inputCls}>
            <option value="non_specificato">Non specificato</option>
            <option value="maschio">Maschio</option>
            <option value="femmina">Femmina</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Razza</label>
          <input {...register('breed')} placeholder="Es. Labrador" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Data di nascita</label>
          <input {...register('birth_date')} type="date" max={today()} className={inputCls} />
          {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelCls}>Microchip</label>
        <input {...register('microchip')} placeholder="15 cifre" inputMode="numeric" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Note</label>
        <textarea {...register('notes')} rows={3} placeholder="Allergie, carattere, particolarità…" className={inputCls} />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-brand-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {uploading ? 'Caricamento foto…' : busy ? 'Salvataggio…' : pet ? 'Salva modifiche' : 'Aggiungi animale'}
      </button>
    </form>
  )
}
