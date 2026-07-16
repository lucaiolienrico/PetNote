import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, Pill } from 'lucide-react'
import { toast } from 'sonner'
import {
  useMedications, useCreateMedication, useUpdateMedication, useDeleteMedication,
  type Medication,
} from '@/lib/queries/medications'
import { formatIt } from '@/lib/health'
import { useConfirmTap } from '@/hooks/useConfirmTap'
import { useAuthStore, selectHasFullAccess } from '@/stores/auth.store'
import { LockedFeature } from '@/components/shared/LockedFeature'

const today = () => new Date().toISOString().slice(0, 10)

const schema = z.object({
  drug_name:  z.string().trim().min(1, 'Nome farmaco obbligatorio').max(120),
  dosage:     z.string().trim().max(120).optional(),
  frequency:  z.string().trim().max(120).optional(),
  start_date: z.string().min(1, 'Data inizio obbligatoria').max(10),
  end_date:   z.string().optional(),
  notes:      z.string().trim().max(1000).optional(),
}).refine(
  v => !v.end_date || v.end_date >= v.start_date,
  { message: 'La fine terapia deve essere dopo o uguale alla data di inizio', path: ['end_date'] },
)
type FormData = z.infer<typeof schema>
const nn = (v?: string) => (v && v.trim() !== '' ? v.trim() : null)

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

// Pro-only totale — vedi VaccinationsPage.tsx per il razionale.
export function MedicationsPage() {
  const { id: petId } = useParams<{ id: string }>()
  const hasFullAccess = useAuthStore(selectHasFullAccess)
  if (!hasFullAccess) {
    return <LockedFeature title="Farmaci" icon={Pill} backTo={`/app/pets/${petId}`} />
  }
  return <MedicationsPageContent />
}

function MedicationsPageContent() {
  const { id: petId } = useParams<{ id: string }>()
  const { data: medications, isLoading } = useMedications(petId)
  const createM = useCreateMedication(petId!)
  const updateM = useUpdateMedication(petId!)
  const deleteM = useDeleteMedication(petId!)

  const [editing, setEditing]   = useState<Medication | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { tap, isArmed } = useConfirmTap()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openNew = () => { setEditing(null); reset({ start_date: today() }); setShowForm(true) }
  const openEdit = (m: Medication) => {
    setEditing(m)
    reset({
      drug_name:  m.drug_name,
      dosage:     m.dosage ?? '',
      frequency:  m.frequency ?? '',
      start_date: m.start_date,
      end_date:   m.end_date ?? '',
      notes:      m.notes ?? '',
    })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const payload = {
      drug_name:  data.drug_name,
      dosage:     nn(data.dosage),
      frequency:  nn(data.frequency),
      start_date: data.start_date,
      end_date:   nn(data.end_date),
      notes:      nn(data.notes),
    }
    try {
      if (editing) await updateM.mutateAsync({ id: editing.id, ...payload })
      else         await createM.mutateAsync(payload)
      toast.success(editing ? 'Terapia aggiornata' : 'Terapia registrata')
      setShowForm(false)
    } catch {
      toast.error('Salvataggio non riuscito')
    }
  }

  const onDelete = (id: string) => tap(id, async () => {
    try {
      await deleteM.mutateAsync(id)
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
          <h1 className="text-xl font-bold text-slate-900">Farmaci</h1>
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
            <label className={labelCls}>Farmaco *</label>
            <input {...register('drug_name')} placeholder="Es. Amoxicillina" className={inputCls} />
            {errors.drug_name && <p className="text-red-500 text-xs mt-1">{errors.drug_name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Dosaggio</label>
              <input {...register('dosage')} placeholder="Es. 250mg" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Frequenza</label>
              <input {...register('frequency')} placeholder="Es. 2 volte/giorno" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Data inizio *</label>
              <input {...register('start_date')} type="date" className={inputCls} />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Fine terapia</label>
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

      {!isLoading && medications?.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-2">
          <Pill size={26} className="text-brand-600 mx-auto" />
          <p className="text-sm text-slate-600">Nessuna terapia registrata</p>
        </div>
      )}

      <div className="space-y-2.5">
        {medications?.map(m => {
          const isOngoing = !m.end_date || m.end_date >= today()
          return (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => openEdit(m)} className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-slate-900">{m.drug_name}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {[m.dosage, m.frequency].filter(Boolean).join(' · ') || 'Dettagli non specificati'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dal {formatIt(m.start_date)}{m.end_date && ` al ${formatIt(m.end_date)}`}
                  </p>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                    isOngoing ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isOngoing ? 'In corso' : 'Conclusa'}
                  </span>
                  <button
                    onClick={() => onDelete(m.id)}
                    className={`p-1 ${isArmed(m.id) ? 'text-red-600' : 'text-slate-300'}`}
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
