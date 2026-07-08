import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, Syringe } from 'lucide-react'
import { toast } from 'sonner'
import {
  useVaccinations, useCreateVaccination, useUpdateVaccination, useDeleteVaccination,
  type Vaccination,
} from '@/lib/queries/vaccinations'
import { ReminderBadge } from '@/components/shared/ReminderBadge'
import { formatIt } from '@/lib/health'

const today = () => new Date().toISOString().slice(0, 10)

const schema = z.object({
  vaccine_name:    z.string().trim().min(1, 'Nome vaccino obbligatorio').max(120),
  administered_at: z.string().min(1, 'Data obbligatoria').max(10),
  next_due_at:     z.string().optional(),
  veterinarian:    z.string().trim().max(120).optional(),
  batch_number:    z.string().trim().max(60).optional(),
  notes:           z.string().trim().max(1000).optional(),
}).refine(
  v => !v.next_due_at || v.next_due_at > v.administered_at,
  { message: 'La scadenza deve essere dopo la data di somministrazione', path: ['next_due_at'] },
)
type FormData = z.infer<typeof schema>
const nn = (v?: string) => (v && v.trim() !== '' ? v.trim() : null)

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

export function VaccinationsPage() {
  const { id: petId } = useParams<{ id: string }>()
  const { data: vaccinations, isLoading } = useVaccinations(petId)
  const createV = useCreateVaccination(petId!)
  const updateV = useUpdateVaccination(petId!)
  const deleteV = useDeleteVaccination(petId!)

  const [editing, setEditing]   = useState<Vaccination | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openNew = () => { setEditing(null); reset({ administered_at: today() }); setShowForm(true) }
  const openEdit = (v: Vaccination) => {
    setEditing(v)
    reset({
      vaccine_name:    v.vaccine_name,
      administered_at: v.administered_at,
      next_due_at:     v.next_due_at ?? '',
      veterinarian:    v.veterinarian ?? '',
      batch_number:    v.batch_number ?? '',
      notes:           v.notes ?? '',
    })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const payload = {
      vaccine_name:    data.vaccine_name,
      administered_at: data.administered_at,
      next_due_at:     nn(data.next_due_at),
      veterinarian:    nn(data.veterinarian),
      batch_number:    nn(data.batch_number),
      notes:           nn(data.notes),
    }
    try {
      if (editing) await updateV.mutateAsync({ id: editing.id, ...payload })
      else         await createV.mutateAsync(payload)
      toast.success(editing ? 'Vaccinazione aggiornata' : 'Vaccinazione registrata')
      setShowForm(false)
    } catch {
      toast.error('Salvataggio non riuscito')
    }
  }

  const onDelete = async (id: string) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); setTimeout(() => setConfirmDeleteId(null), 3000); return }
    try {
      await deleteV.mutateAsync(id)
      toast.success('Rimossa')
    } catch {
      toast.error('Rimozione non riuscita')
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link to={`/app/pets/${petId}`} className="p-1 text-gray-500"><ArrowLeft size={22} /></Link>
          <h1 className="text-xl font-bold text-gray-900">Vaccinazioni</h1>
        </div>
        {!showForm && (
          <button onClick={openNew} className="flex items-center gap-1.5 bg-brand-600 text-white rounded-xl px-3.5 py-2 text-sm font-semibold hover:bg-brand-700">
            <Plus size={16} strokeWidth={2.5} /> Aggiungi
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div>
            <label className={labelCls}>Vaccino *</label>
            <input {...register('vaccine_name')} placeholder="Es. Trivalente" className={inputCls} />
            {errors.vaccine_name && <p className="text-red-500 text-xs mt-1">{errors.vaccine_name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Data somministrazione *</label>
              <input {...register('administered_at')} type="date" max={today()} className={inputCls} />
              {errors.administered_at && <p className="text-red-500 text-xs mt-1">{errors.administered_at.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Prossima scadenza</label>
              <input {...register('next_due_at')} type="date" className={inputCls} />
              {errors.next_due_at && <p className="text-red-500 text-xs mt-1">{errors.next_due_at.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Veterinario</label>
              <input {...register('veterinarian')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Lotto</label>
              <input {...register('batch_number')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Note</label>
            <textarea {...register('notes')} rows={2} className={inputCls} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold">
              Annulla
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
              {isSubmitting ? 'Salvataggio…' : 'Salva'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />}

      {!isLoading && vaccinations?.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
          <Syringe size={26} className="text-brand-600 mx-auto" />
          <p className="text-sm text-gray-500">Nessuna vaccinazione registrata</p>
        </div>
      )}

      <div className="space-y-2.5">
        {vaccinations?.map(v => (
          <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => openEdit(v)} className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-gray-900">{v.vaccine_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Somministrato il {formatIt(v.administered_at)}
                  {v.next_due_at && ` · scade il ${formatIt(v.next_due_at)}`}
                </p>
                {v.veterinarian && <p className="text-xs text-gray-400 mt-0.5">Dr. {v.veterinarian}</p>}
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ReminderBadge nextDueAt={v.next_due_at} />
                <button
                  onClick={() => onDelete(v.id)}
                  className={`p-1 ${confirmDeleteId === v.id ? 'text-red-600' : 'text-gray-300'}`}
                  aria-label="Elimina"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
