import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, Bell } from 'lucide-react'
import { toast } from 'sonner'
import {
  useReminders, useCreateReminder, useUpdateReminder, useDeleteReminder,
  type Reminder,
} from '@/lib/queries/reminders'
import { formatIt } from '@/lib/health'
import { useConfirmTap } from '@/hooks/useConfirmTap'
import { useAuthStore, selectHasFullAccess } from '@/stores/auth.store'
import { LockedFeature } from '@/components/shared/LockedFeature'

const today = () => new Date().toISOString().slice(0, 10)

const schema = z.object({
  title:    z.string().trim().min(1, 'Titolo obbligatorio').max(120),
  due_date: z.string().min(1, 'Data obbligatoria').max(10),
  notes:    z.string().trim().max(1000).optional(),
})
type FormData = z.infer<typeof schema>
const nn = (v?: string) => (v && v.trim() !== '' ? v.trim() : null)

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

// Pro-only totale — vedi VaccinationsPage.tsx per il razionale.
export function RemindersPage() {
  const { id: petId } = useParams<{ id: string }>()
  const hasFullAccess = useAuthStore(selectHasFullAccess)
  if (!hasFullAccess) {
    return <LockedFeature title="Promemoria" icon={Bell} backTo={`/app/pets/${petId}`} />
  }
  return <RemindersPageContent />
}

function RemindersPageContent() {
  const { id: petId } = useParams<{ id: string }>()
  const { data: reminders, isLoading } = useReminders(petId)
  const createR = useCreateReminder(petId!)
  const updateR = useUpdateReminder(petId!)
  const deleteR = useDeleteReminder(petId!)

  const [editing, setEditing]   = useState<Reminder | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { tap, isArmed } = useConfirmTap()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openNew = () => { setEditing(null); reset({ due_date: today() }); setShowForm(true) }
  const openEdit = (r: Reminder) => {
    setEditing(r)
    reset({
      title:    r.title,
      due_date: r.due_date,
      notes:    r.notes ?? '',
    })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const payload = {
      title:    data.title,
      due_date: data.due_date,
      notes:    nn(data.notes),
    }
    try {
      if (editing) await updateR.mutateAsync({ id: editing.id, ...payload })
      else         await createR.mutateAsync(payload)
      toast.success(editing ? 'Promemoria aggiornato' : 'Promemoria creato')
      setShowForm(false)
    } catch {
      toast.error('Salvataggio non riuscito')
    }
  }

  const onDelete = (id: string) => tap(id, async () => {
    try {
      await deleteR.mutateAsync(id)
      toast.success('Rimosso')
    } catch {
      toast.error('Rimozione non riuscita')
    }
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link to={`/app/pets/${petId}`} className="p-1 text-gray-500"><ArrowLeft size={22} /></Link>
          <h1 className="text-xl font-bold text-gray-900">Promemoria</h1>
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
            <label className={labelCls}>Titolo *</label>
            <input {...register('title')} placeholder="Es. Portare libretto sanitario dal vet" className={inputCls} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Data *</label>
            <input {...register('due_date')} type="date" className={inputCls} />
            {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date.message}</p>}
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

      {!isLoading && reminders?.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
          <Bell size={26} className="text-brand-600 mx-auto" />
          <p className="text-sm text-gray-500">Nessun promemoria creato</p>
        </div>
      )}

      <div className="space-y-2.5">
        {reminders?.map(r => {
          const isPast = r.due_date < today()
          return (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => openEdit(r)} className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isPast ? 'Scaduto il' : 'Previsto per il'} {formatIt(r.due_date)}
                  </p>
                  {r.notes && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{r.notes}</p>}
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isPast && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-red-50 text-red-600">
                      Scaduto
                    </span>
                  )}
                  <button
                    onClick={() => onDelete(r.id)}
                    className={`p-1 ${isArmed(r.id) ? 'text-red-600' : 'text-gray-300'}`}
                    aria-label="Elimina"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
