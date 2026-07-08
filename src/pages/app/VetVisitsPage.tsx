import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import {
  useVetVisits, useCreateVetVisit, useUpdateVetVisit, useDeleteVetVisit,
  type VetVisit,
} from '@/lib/queries/vetVisits'
import { formatIt } from '@/lib/health'
import { useConfirmTap } from '@/hooks/useConfirmTap'

const today = () => new Date().toISOString().slice(0, 10)

const schema = z.object({
  reason:     z.string().trim().min(1, 'Motivo obbligatorio').max(200),
  visited_at: z.string().min(1, 'Data obbligatoria').max(10),
  clinic:       z.string().trim().max(120).optional(),
  veterinarian: z.string().trim().max(120).optional(),
  diagnosis:    z.string().trim().max(1000).optional(),
  cost:         z.string().optional()
                  .refine(v => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Costo non valido'),
  notes:        z.string().trim().max(1000).optional(),
})
type FormData = z.infer<typeof schema>
const nn = (v?: string) => (v && v.trim() !== '' ? v.trim() : null)

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })

export function VetVisitsPage() {
  const { id: petId } = useParams<{ id: string }>()
  const { data: visits, isLoading } = useVetVisits(petId)
  const createVisit = useCreateVetVisit(petId!)
  const updateVisit = useUpdateVetVisit(petId!)
  const deleteVisit = useDeleteVetVisit(petId!)

  const [editing, setEditing]   = useState<VetVisit | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { tap, isArmed } = useConfirmTap()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openNew = () => { setEditing(null); reset({ visited_at: today() }); setShowForm(true) }
  const openEdit = (v: VetVisit) => {
    setEditing(v)
    reset({
      reason:       v.reason,
      visited_at:   v.visited_at,
      clinic:       v.clinic ?? '',
      veterinarian: v.veterinarian ?? '',
      diagnosis:    v.diagnosis ?? '',
      cost:         v.cost != null ? String(v.cost) : '',
      notes:        v.notes ?? '',
    })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const payload = {
      reason:       data.reason,
      visited_at:   data.visited_at,
      clinic:       nn(data.clinic),
      veterinarian: nn(data.veterinarian),
      diagnosis:    nn(data.diagnosis),
      cost:         data.cost && data.cost.trim() !== '' ? Number(data.cost) : null,
      notes:        nn(data.notes),
    }
    try {
      if (editing) await updateVisit.mutateAsync({ id: editing.id, ...payload })
      else         await createVisit.mutateAsync(payload)
      toast.success(editing ? 'Visita aggiornata' : 'Visita registrata')
      setShowForm(false)
    } catch {
      toast.error('Salvataggio non riuscito')
    }
  }

  const onDelete = (id: string) => tap(id, async () => {
    try {
      await deleteVisit.mutateAsync(id)
      toast.success('Rimossa')
    } catch {
      toast.error('Rimozione non riuscita')
    }
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link to={`/app/pets/${petId}`} className="p-1 text-gray-500"><ArrowLeft size={22} /></Link>
          <h1 className="text-xl font-bold text-gray-900">Visite veterinarie</h1>
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
            <label className={labelCls}>Motivo della visita *</label>
            <input {...register('reason')} placeholder="Es. Controllo di routine" className={inputCls} />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Data *</label>
              <input {...register('visited_at')} type="date" max={today()} className={inputCls} />
              {errors.visited_at && <p className="text-red-500 text-xs mt-1">{errors.visited_at.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Costo (€)</label>
              <input {...register('cost')} inputMode="decimal" placeholder="0.00" className={inputCls} />
              {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Clinica</label>
              <input {...register('clinic')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Veterinario</label>
              <input {...register('veterinarian')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Diagnosi</label>
            <textarea {...register('diagnosis')} rows={2} className={inputCls} />
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

      {!isLoading && visits?.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
          <Stethoscope size={26} className="text-brand-600 mx-auto" />
          <p className="text-sm text-gray-500">Nessuna visita registrata</p>
        </div>
      )}

      <div className="space-y-2.5">
        {visits?.map(v => (
          <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => openEdit(v)} className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-gray-900">{v.reason}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatIt(v.visited_at)}
                  {v.clinic && ` · ${v.clinic}`}
                  {v.veterinarian && ` · Dr. ${v.veterinarian}`}
                </p>
                {v.diagnosis && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{v.diagnosis}</p>}
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                {v.cost != null && (
                  <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{eur.format(v.cost)}</span>
                )}
                <button
                  onClick={() => onDelete(v.id)}
                  className={`p-1 ${isArmed(v.id) ? 'text-red-600' : 'text-gray-300'}`}
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
