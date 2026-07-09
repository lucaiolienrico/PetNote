import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, Scale } from 'lucide-react'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  useWeightLogs, useCreateWeightLog, useUpdateWeightLog, useDeleteWeightLog,
  type WeightLog,
} from '@/lib/queries/weightLogs'
import { formatIt } from '@/lib/health'
import { useConfirmTap } from '@/hooks/useConfirmTap'
import { useAuthStore, selectHasFullAccess } from '@/stores/auth.store'
import { LockedFeature } from '@/components/shared/LockedFeature'

const today = () => new Date().toISOString().slice(0, 10)
const BRAND_600 = '#2563eb' // tailwind.config.js brand.600 — Recharts non legge classi utility, serve hex

// Constraint DB: weight_kg > 0 AND weight_kg < 500 (NUMERIC 5,3)
const schema = z.object({
  weight_kg:   z.string().min(1, 'Peso obbligatorio')
                 .refine(v => !Number.isNaN(Number(v)) && Number(v) > 0 && Number(v) < 500, 'Peso non valido (0-500 kg)'),
  measured_at: z.string().min(1, 'Data obbligatoria').max(10),
  notes:       z.string().trim().max(1000).optional(),
})
type FormData = z.infer<typeof schema>
const nn = (v?: string) => (v && v.trim() !== '' ? v.trim() : null)

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

const fmtKg = (v: number) => `${v.toLocaleString('it-IT', { maximumFractionDigits: 3 })} kg`
const fmtAxisDate = (iso: string) => new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })

// Pro-only totale — vedi VaccinationsPage.tsx per il razionale.
export function WeightPage() {
  const { id: petId } = useParams<{ id: string }>()
  const hasFullAccess = useAuthStore(selectHasFullAccess)
  if (!hasFullAccess) {
    return <LockedFeature title="Peso" icon={Scale} backTo={`/app/pets/${petId}`} />
  }
  return <WeightPageContent />
}

function WeightPageContent() {
  const { id: petId } = useParams<{ id: string }>()
  const { data: logs, isLoading } = useWeightLogs(petId)
  const createLog = useCreateWeightLog(petId!)
  const updateLog = useUpdateWeightLog(petId!)
  const deleteLog = useDeleteWeightLog(petId!)

  const [editing, setEditing]   = useState<WeightLog | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { tap, isArmed } = useConfirmTap()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openNew = () => { setEditing(null); reset({ measured_at: today() }); setShowForm(true) }
  const openEdit = (l: WeightLog) => {
    setEditing(l)
    reset({
      weight_kg:   String(l.weight_kg),
      measured_at: l.measured_at,
      notes:       l.notes ?? '',
    })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const payload = {
      weight_kg:   Number(data.weight_kg),
      measured_at: data.measured_at,
      notes:       nn(data.notes),
    }
    try {
      if (editing) await updateLog.mutateAsync({ id: editing.id, ...payload })
      else         await createLog.mutateAsync(payload)
      toast.success(editing ? 'Peso aggiornato' : 'Peso registrato')
      setShowForm(false)
    } catch {
      toast.error('Salvataggio non riuscito')
    }
  }

  const onDelete = (id: string) => tap(id, async () => {
    try {
      await deleteLog.mutateAsync(id)
      toast.success('Rimosso')
    } catch {
      toast.error('Rimozione non riuscita')
    }
  })

  // Query è DESC (recente in cima, sfrutta indice) — grafico vuole ordine cronologico ascendente
  const chartData = logs ? [...logs].reverse() : []

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link to={`/app/pets/${petId}`} className="p-1 text-gray-500"><ArrowLeft size={22} /></Link>
          <h1 className="text-xl font-bold text-gray-900">Peso</h1>
        </div>
        {!showForm && (
          <button onClick={openNew} className="flex items-center gap-1.5 bg-brand-600 text-white rounded-xl px-3.5 py-2 text-sm font-semibold hover:bg-brand-700">
            <Plus size={16} strokeWidth={2.5} /> Aggiungi
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Peso (kg) *</label>
              <input {...register('weight_kg')} inputMode="decimal" placeholder="Es. 4.250" className={inputCls} />
              {errors.weight_kg && <p className="text-red-500 text-xs mt-1">{errors.weight_kg.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Data *</label>
              <input {...register('measured_at')} type="date" max={today()} className={inputCls} />
              {errors.measured_at && <p className="text-red-500 text-xs mt-1">{errors.measured_at.message}</p>}
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

      {isLoading && <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />}

      {!isLoading && logs?.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
          <Scale size={26} className="text-brand-600 mx-auto" />
          <p className="text-sm text-gray-500">Nessuna misurazione registrata</p>
        </div>
      )}

      {!isLoading && chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="measured_at"
                tickFormatter={fmtAxisDate}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={40}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                formatter={(value) => [fmtKg(Number(value)), 'Peso']}
                labelFormatter={(label) => (label ? formatIt(String(label)) : '')}
                contentStyle={{ borderRadius: 12, border: '1px solid #f3f4f6', fontSize: 13 }}
              />
              <Line
                type="monotone"
                dataKey="weight_kg"
                stroke={BRAND_600}
                strokeWidth={2.5}
                dot={{ r: 3, fill: BRAND_600 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-2.5">
        {logs?.map(l => (
          <div key={l.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => openEdit(l)} className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-gray-900">{fmtKg(l.weight_kg)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatIt(l.measured_at)}</p>
                {l.notes && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{l.notes}</p>}
              </button>
              <button
                onClick={() => onDelete(l.id)}
                className={`p-1 flex-shrink-0 ${isArmed(l.id) ? 'text-red-600' : 'text-gray-300'}`}
                aria-label="Elimina"
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
