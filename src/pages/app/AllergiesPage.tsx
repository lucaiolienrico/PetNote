import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAllergies, useCreateAllergy, useUpdateAllergy, useDeleteAllergy,
  type Allergy,
} from '@/lib/queries/allergies'
import { formatIt } from '@/lib/health'
import { useConfirmTap } from '@/hooks/useConfirmTap'
import { useAuthStore, selectHasFullAccess } from '@/stores/auth.store'
import { FREE_LIMITS, PlanLimitError } from '@/lib/planLimits'
import { UpgradeModal } from '@/components/shared/UpgradeModal'

const today = () => new Date().toISOString().slice(0, 10)

const SEVERITY_META: Record<string, { label: string; cls: string }> = {
  lieve:    { label: 'Lieve',    cls: 'bg-brand-50 text-brand-700' },
  moderata: { label: 'Moderata', cls: 'bg-amber-50 text-amber-600' },
  grave:    { label: 'Grave',    cls: 'bg-red-50 text-red-600' },
}

const schema = z.object({
  allergen:     z.string().trim().min(1, 'Allergene obbligatorio').max(120),
  severity:     z.enum(['lieve', 'moderata', 'grave']),
  reaction:     z.string().trim().max(500).optional(),
  diagnosed_at: z.string().optional(),
  notes:        z.string().trim().max(1000).optional(),
})
type FormData = z.infer<typeof schema>
const nn = (v?: string) => (v && v.trim() !== '' ? v.trim() : null)

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

export function AllergiesPage() {
  const { id: petId } = useParams<{ id: string }>()
  const hasFullAccess = useAuthStore(selectHasFullAccess)
  const { data: allergies, isLoading } = useAllergies(petId)
  const createA = useCreateAllergy(petId!, hasFullAccess)
  const updateA = useUpdateAllergy(petId!)
  const deleteA = useDeleteAllergy(petId!)

  const [editing, setEditing]   = useState<Allergy | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { tap, isArmed } = useConfirmTap()

  // Free: 1 allergia per animale. Oltre soglia → upsell invece del form.
  const canAdd = hasFullAccess || (allergies?.length ?? 0) < FREE_LIMITS.allergiesPerPet

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openNew = () => { setEditing(null); reset({ severity: 'lieve' }); setShowForm(true) }
  const openEdit = (a: Allergy) => {
    setEditing(a)
    reset({
      allergen:     a.allergen,
      severity:     a.severity as FormData['severity'],
      reaction:     a.reaction ?? '',
      diagnosed_at: a.diagnosed_at ?? '',
      notes:        a.notes ?? '',
    })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const payload = {
      allergen:     data.allergen,
      severity:     data.severity,
      reaction:     nn(data.reaction),
      diagnosed_at: nn(data.diagnosed_at),
      notes:        nn(data.notes),
    }
    try {
      if (editing) await updateA.mutateAsync({ id: editing.id, ...payload })
      else         await createA.mutateAsync(payload)
      toast.success(editing ? 'Allergia aggiornata' : 'Allergia registrata')
      setShowForm(false)
    } catch (err) {
      if (err instanceof PlanLimitError) {
        setShowForm(false)
        setShowUpgrade(true)
        return
      }
      toast.error('Salvataggio non riuscito')
    }
  }

  const onDelete = (id: string) => tap(id, async () => {
    try {
      await deleteA.mutateAsync(id)
      toast.success('Rimossa')
    } catch {
      toast.error('Rimozione non riuscita')
    }
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link to={`/app/pets/${petId}`} className="p-1 text-slate-600"><ArrowLeft size={22} /></Link>
          <h1 className="text-xl font-bold text-slate-900">Allergie</h1>
        </div>
        {!showForm && (
          <button
            onClick={() => canAdd ? openNew() : setShowUpgrade(true)}
            className="flex items-center gap-1.5 bg-brand-600 text-white rounded-xl px-3.5 py-2 text-sm font-semibold hover:bg-brand-700"
          >
            <Plus size={16} strokeWidth={2.5} /> Aggiungi
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <div>
            <label className={labelCls}>Allergene *</label>
            <input {...register('allergen')} placeholder="Es. Polline, Pollo, Penicillina" className={inputCls} />
            {errors.allergen && <p className="text-red-500 text-xs mt-1">{errors.allergen.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Gravità *</label>
              <select {...register('severity')} className={inputCls}>
                <option value="lieve">Lieve</option>
                <option value="moderata">Moderata</option>
                <option value="grave">Grave</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Data diagnosi</label>
              <input {...register('diagnosed_at')} type="date" max={today()} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Reazione</label>
            <input {...register('reaction')} placeholder="Es. Prurito, gonfiore" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Note</label>
            <textarea {...register('notes')} rows={2} className={inputCls} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold">
              Annulla
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
              {isSubmitting ? 'Salvataggio…' : 'Salva'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />}

      {!isLoading && allergies?.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-2">
          <AlertTriangle size={26} className="text-brand-600 mx-auto" />
          <p className="text-sm text-slate-600">Nessuna allergia registrata</p>
        </div>
      )}

      <div className="space-y-2.5">
        {allergies?.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => openEdit(a)} className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-slate-900">{a.allergen}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {a.reaction || 'Reazione non specificata'}
                  {a.diagnosed_at && ` · diagnosticata il ${formatIt(a.diagnosed_at)}`}
                </p>
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${SEVERITY_META[a.severity]?.cls ?? 'bg-slate-100 text-slate-600'}`}>
                  {SEVERITY_META[a.severity]?.label ?? a.severity}
                </span>
                <button
                  onClick={() => onDelete(a.id)}
                  className={`p-1 ${isArmed(a.id) ? 'text-red-600' : 'text-slate-300'}`}
                  aria-label="Elimina"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}
