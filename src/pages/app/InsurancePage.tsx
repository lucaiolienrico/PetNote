import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import {
  useInsurancePolicies, useCreateInsurancePolicy, useUpdateInsurancePolicy, useDeleteInsurancePolicy,
  type InsurancePolicy,
} from '@/lib/queries/insurance'
import { formatIt } from '@/lib/health'
import { useConfirmTap } from '@/hooks/useConfirmTap'
import { useAuthStore, selectHasFullAccess } from '@/stores/auth.store'
import { LockedFeature } from '@/components/shared/LockedFeature'

const today = () => new Date().toISOString().slice(0, 10)

const FREQUENCY_LABEL: Record<string, string> = {
  mensile: 'Mensile',
  annuale: 'Annuale',
}

const schema = z.object({
  provider:          z.string().trim().min(1, 'Compagnia obbligatoria').max(120),
  policy_number:     z.string().trim().max(60).optional(),
  billing_frequency: z.enum(['mensile', 'annuale']),
  premium_amount:    z.string().min(1, 'Importo obbligatorio')
                        .refine(v => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Importo non valido'),
  start_date:        z.string().min(1, 'Data inizio obbligatoria').max(10),
  end_date:          z.string().optional(),
  notes:             z.string().trim().max(1000).optional(),
}).refine(
  v => !v.end_date || v.end_date >= v.start_date,
  { message: 'La scadenza deve essere dopo o uguale alla data di inizio', path: ['end_date'] },
)
type FormData = z.infer<typeof schema>
const nn = (v?: string) => (v && v.trim() !== '' ? v.trim() : null)

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'
const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })

// Pro-only totale — vedi VaccinationsPage.tsx per il razionale.
export function InsurancePage() {
  const { id: petId } = useParams<{ id: string }>()
  const hasFullAccess = useAuthStore(selectHasFullAccess)
  if (!hasFullAccess) {
    return <LockedFeature title="Assicurazioni" icon={ShieldCheck} backTo={`/app/pets/${petId}`} />
  }
  return <InsurancePageContent />
}

function InsurancePageContent() {
  const { id: petId } = useParams<{ id: string }>()
  const { data: policies, isLoading } = useInsurancePolicies(petId)
  const createP = useCreateInsurancePolicy(petId!)
  const updateP = useUpdateInsurancePolicy(petId!)
  const deleteP = useDeleteInsurancePolicy(petId!)

  const [editing, setEditing]   = useState<InsurancePolicy | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { tap, isArmed } = useConfirmTap()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openNew = () => { setEditing(null); reset({ start_date: today(), billing_frequency: 'mensile' }); setShowForm(true) }
  const openEdit = (p: InsurancePolicy) => {
    setEditing(p)
    reset({
      provider:          p.provider,
      policy_number:     p.policy_number ?? '',
      billing_frequency: p.billing_frequency as FormData['billing_frequency'],
      premium_amount:    String(p.premium_amount),
      start_date:        p.start_date,
      end_date:          p.end_date ?? '',
      notes:             p.notes ?? '',
    })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const payload = {
      provider:          data.provider,
      policy_number:     nn(data.policy_number),
      billing_frequency: data.billing_frequency,
      premium_amount:    Number(data.premium_amount),
      start_date:        data.start_date,
      end_date:          nn(data.end_date),
      notes:             nn(data.notes),
    }
    try {
      if (editing) await updateP.mutateAsync({ id: editing.id, ...payload })
      else         await createP.mutateAsync(payload)
      toast.success(editing ? 'Polizza aggiornata' : 'Polizza registrata')
      setShowForm(false)
    } catch {
      toast.error('Salvataggio non riuscito')
    }
  }

  const onDelete = (id: string) => tap(id, async () => {
    try {
      await deleteP.mutateAsync(id)
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
          <h1 className="text-xl font-bold text-slate-900">Assicurazioni</h1>
        </div>
        {!showForm && (
          <button onClick={openNew} className="flex items-center gap-1.5 bg-brand-600 text-white rounded-xl px-3.5 py-2 text-sm font-semibold hover:bg-brand-700">
            <Plus size={16} strokeWidth={2.5} /> Aggiungi
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <div>
            <label className={labelCls}>Compagnia *</label>
            <input {...register('provider')} placeholder="Es. UnipolSai Pet" className={inputCls} />
            {errors.provider && <p className="text-red-500 text-xs mt-1">{errors.provider.message}</p>}
          </div>
          <div>
            <label className={labelCls}>N. polizza</label>
            <input {...register('policy_number')} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Cadenza *</label>
              <select {...register('billing_frequency')} className={inputCls}>
                <option value="mensile">Mensile</option>
                <option value="annuale">Annuale</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Premio (€) *</label>
              <input {...register('premium_amount')} inputMode="decimal" placeholder="0.00" className={inputCls} />
              {errors.premium_amount && <p className="text-red-500 text-xs mt-1">{errors.premium_amount.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Data inizio *</label>
              <input {...register('start_date')} type="date" className={inputCls} />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Scadenza</label>
              <input {...register('end_date')} type="date" className={inputCls} />
              {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
            </div>
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

      {!isLoading && policies?.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-2">
          <ShieldCheck size={26} className="text-brand-600 mx-auto" />
          <p className="text-sm text-slate-600">Nessuna polizza registrata</p>
        </div>
      )}

      <div className="space-y-2.5">
        {policies?.map(p => {
          const isActive = !p.end_date || p.end_date >= today()
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-slate-900">{p.provider}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {eur.format(p.premium_amount)} · {FREQUENCY_LABEL[p.billing_frequency] ?? p.billing_frequency}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dal {formatIt(p.start_date)}{p.end_date && ` al ${formatIt(p.end_date)}`}
                    {p.policy_number && ` · Polizza ${p.policy_number}`}
                  </p>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isActive ? 'Attiva' : 'Scaduta'}
                  </span>
                  <button
                    onClick={() => onDelete(p.id)}
                    className={`p-1 ${isArmed(p.id) ? 'text-red-600' : 'text-slate-300'}`}
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
