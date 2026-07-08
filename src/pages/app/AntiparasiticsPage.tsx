import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, Bug } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAntiparasitics, useCreateAntiparasitic, useUpdateAntiparasitic, useDeleteAntiparasitic,
  type Antiparasitic,
} from '@/lib/queries/antiparasitics'
import { ReminderBadge } from '@/components/shared/ReminderBadge'
import { formatIt } from '@/lib/health'

const today = () => new Date().toISOString().slice(0, 10)

const TYPE_LABEL: Record<string, string> = {
  interno:  'Interno',
  esterno:  'Esterno',
  entrambi: 'Interno + Esterno',
}

const schema = z.object({
  product_name:    z.string().trim().min(1, 'Nome prodotto obbligatorio').max(120),
  type:            z.enum(['interno', 'esterno', 'entrambi']),
  administered_at: z.string().min(1, 'Data obbligatoria').max(10),
  next_due_at:     z.string().optional(),
  notes:           z.string().trim().max(1000).optional(),
}).refine(
  v => !v.next_due_at || v.next_due_at > v.administered_at,
  { message: 'La scadenza deve essere dopo la data di somministrazione', path: ['next_due_at'] },
)
type FormData = z.infer<typeof schema>
const nn = (v?: string) => (v && v.trim() !== '' ? v.trim() : null)

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

export function AntiparasiticsPage() {
  const { id: petId } = useParams<{ id: string }>()
  const { data: antiparasitics, isLoading } = useAntiparasitics(petId)
  const createA = useCreateAntiparasitic(petId!)
  const updateA = useUpdateAntiparasitic(petId!)
  const deleteA = useDeleteAntiparasitic(petId!)

  const [editing, setEditing]   = useState<Antiparasitic | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openNew = () => { setEditing(null); reset({ administered_at: today(), type: 'entrambi' }); setShowForm(true) }
  const openEdit = (a: Antiparasitic) => {
    setEditing(a)
    reset({
      product_name:    a.product_name,
      type:            a.type as FormData['type'],
      administered_at: a.administered_at,
      next_due_at:     a.next_due_at ?? '',
      notes:           a.notes ?? '',
    })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const payload = {
      product_name:    data.product_name,
      type:            data.type,
      administered_at: data.administered_at,
      next_due_at:     nn(data.next_due_at),
      notes:           nn(data.notes),
    }
    try {
      if (editing) await updateA.mutateAsync({ id: editing.id, ...payload })
      else         await createA.mutateAsync(payload)
      toast.success(editing ? 'Trattamento aggiornato' : 'Trattamento registrato')
      setShowForm(false)
    } catch {
      toast.error('Salvataggio non riuscito')
    }
  }

  const onDelete = async (id: string) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); setTimeout(() => setConfirmDeleteId(null), 3000); return }
    try {
      await deleteA.mutateAsync(id)
      toast.success('Rimosso')
    } catch {
      toast.error('Rimozione non riuscita')
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link to={`/app/pets/${petId}`} className="p-1 text-gray-500"><ArrowLeft size={22} /></Link>
          <h1 className="text-xl font-bold text-gray-900">Antiparassitari</h1>
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
            <label className={labelCls}>Prodotto *</label>
            <input {...register('product_name')} placeholder="Es. Advantix" className={inputCls} />
            {errors.product_name && <p className="text-red-500 text-xs mt-1">{errors.product_name.message}</p>}
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
          <div>
            <label className={labelCls}>Tipo *</label>
            <select {...register('type')} className={inputCls}>
              <option value="interno">Interno</option>
              <option value="esterno">Esterno</option>
              <option value="entrambi">Interno + Esterno</option>
            </select>
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

      {!isLoading && antiparasitics?.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
          <Bug size={26} className="text-brand-600 mx-auto" />
          <p className="text-sm text-gray-500">Nessun trattamento registrato</p>
        </div>
      )}

      <div className="space-y-2.5">
        {antiparasitics?.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => openEdit(a)} className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-gray-900">{a.product_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {TYPE_LABEL[a.type] ?? a.type} · somministrato il {formatIt(a.administered_at)}
                  {a.next_due_at && ` · scade il ${formatIt(a.next_due_at)}`}
                </p>
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ReminderBadge nextDueAt={a.next_due_at} />
                <button
                  onClick={() => onDelete(a.id)}
                  className={`p-1 ${confirmDeleteId === a.id ? 'text-red-600' : 'text-gray-300'}`}
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
