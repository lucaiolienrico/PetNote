import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import {
  useHealthEvents, useCreateHealthEvent, useUpdateHealthEvent, useDeleteHealthEvent,
  type HealthEvent,
} from '@/lib/queries/healthEvents'
import { formatIt } from '@/lib/health'
import { useConfirmTap } from '@/hooks/useConfirmTap'

const today = () => new Date().toISOString().slice(0, 10)

const schema = z.object({
  event_type:  z.string().trim().min(1, 'Tipo evento obbligatorio').max(120),
  occurred_at: z.string().min(1, 'Data obbligatoria').max(10),
  description: z.string().trim().max(2000).optional(),
})
type FormData = z.infer<typeof schema>
const nn = (v?: string) => (v && v.trim() !== '' ? v.trim() : null)

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

// Suggerimenti rapidi per event_type
const EVENT_SUGGESTIONS = [
  'Sintomo', 'Visita di controllo', 'Trauma', 'Intervento chirurgico',
  'Esame del sangue', 'Radiografia', 'Ecografia', 'Cambio del pelo',
  'Calore', 'Sterilizzazione', 'Altro',
]

export function HealthEventsPage() {
  const { id: petId } = useParams<{ id: string }>()
  const { data: events, isLoading } = useHealthEvents(petId)
  const createEvent = useCreateHealthEvent(petId!)
  const updateEvent = useUpdateHealthEvent(petId!)
  const deleteEvent = useDeleteHealthEvent(petId!)

  const [editing, setEditing]   = useState<HealthEvent | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { tap, isArmed } = useConfirmTap()

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openNew = () => {
    setEditing(null)
    reset({ occurred_at: today(), event_type: '', description: '' })
    setShowForm(true)
  }

  const openEdit = (e: HealthEvent) => {
    setEditing(e)
    reset({
      event_type:  e.event_type,
      occurred_at: e.occurred_at,
      description: e.description ?? '',
    })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const payload = {
      event_type:  data.event_type,
      occurred_at: data.occurred_at,
      description: nn(data.description),
    }
    try {
      if (editing) await updateEvent.mutateAsync({ id: editing.id, ...payload })
      else         await createEvent.mutateAsync(payload)
      toast.success(editing ? 'Evento aggiornato' : 'Evento registrato')
      setShowForm(false)
    } catch {
      toast.error('Salvataggio non riuscito')
    }
  }

  const onDelete = (id: string) => tap(id, async () => {
    try {
      await deleteEvent.mutateAsync(id)
      toast.success('Rimosso')
    } catch {
      toast.error('Rimozione non riuscita')
    }
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link to={`/app/pets/${petId}`} className="p-1 text-gray-500">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Diario sanitario</h1>
        </div>
        {!showForm && (
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 bg-brand-600 text-white rounded-xl px-3.5 py-2 text-sm font-semibold hover:bg-brand-700"
          >
            <Plus size={16} strokeWidth={2.5} /> Aggiungi
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div>
            <label className={labelCls}>Tipo evento *</label>
            <input
              {...register('event_type')}
              placeholder="Es. Visita di controllo"
              className={inputCls}
              list="event-suggestions"
            />
            <datalist id="event-suggestions">
              {EVENT_SUGGESTIONS.map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {errors.event_type && (
              <p className="text-red-500 text-xs mt-1">{errors.event_type.message}</p>
            )}
            {/* Chip suggerimenti rapidi */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {EVENT_SUGGESTIONS.slice(0, 6).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue('event_type', s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 bg-gray-50 active:bg-gray-100"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Data *</label>
            <input
              {...register('occurred_at')}
              type="date"
              max={today()}
              className={inputCls}
            />
            {errors.occurred_at && (
              <p className="text-red-500 text-xs mt-1">{errors.occurred_at.message}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Descrizione</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Dettagli, sintomi, osservazioni…"
              className={inputCls}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Salvataggio…' : 'Salva'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />}

      {!isLoading && events?.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
          <ClipboardList size={26} className="text-brand-600 mx-auto" />
          <p className="text-sm text-gray-500">Nessun evento registrato</p>
          <p className="text-xs text-gray-400">Tieni traccia di sintomi, esami e visite speciali</p>
        </div>
      )}

      <div className="space-y-2.5">
        {events?.map(e => (
          <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => openEdit(e)} className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-gray-900">{e.event_type}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatIt(e.occurred_at)}</p>
                {e.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{e.description}</p>
                )}
              </button>
              <button
                onClick={() => onDelete(e.id)}
                className={`p-1 flex-shrink-0 ${isArmed(e.id) ? 'text-red-600' : 'text-gray-300'}`}
                aria-label="Elimina evento"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
