import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateSubscription } from '@/lib/queries/subscription'

interface Props {
  open:    boolean
  onClose: () => void
}

const BENEFITS = [
  'Animali illimitati',
  'Vaccinazioni, antiparassitari e peso',
  'Visite veterinarie e allergie illimitate',
  'Assicurazioni, documenti e reminder',
]

type PlanKey = 'monthly' | 'yearly'

export function UpgradeModal({ open, onClose }: Props) {
  const createSubscription = useCreateSubscription()
  const [pendingPlan, setPendingPlan] = useState<PlanKey | null>(null)

  if (!open) return null

  const isBusy = createSubscription.isPending

  const choosePlan = async (plan: PlanKey) => {
    setPendingPlan(plan)
    try {
      // Su successo la mutation reindirizza a PayPal — il componente sta
      // per smontarsi, non serve altro qui.
      await createSubscription.mutateAsync(plan)
    } catch {
      toast.error('Impossibile avviare il checkout PayPal. Riprova.')
      setPendingPlan(null)
    }
  }

  // Portal su document.body: il modal vive fuori dall'albero DOM del
  // chiamante (pagina, BottomNav, LockedFeature...), quindi nessun
  // stacking context antenato puo' intrappolarlo sotto altri elementi.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Passa a Premium ⭐</h2>
            <p className="text-sm text-gray-500 mt-1">
              Il piano Free include 1 animale, 1 visita veterinaria e 1 allergia. Sblocca tutto con Premium.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            aria-label="Chiudi"
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="space-y-2.5">
          {BENEFITS.map(b => (
            <li key={b} className="flex items-center gap-2.5 text-sm text-gray-700">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                <Check size={12} className="text-brand-700" strokeWidth={3} />
              </span>
              {b}
            </li>
          ))}
        </ul>

        <div className="space-y-2.5">
          <button
            onClick={() => choosePlan('monthly')}
            disabled={isBusy}
            className="w-full flex items-center justify-between bg-brand-50 hover:bg-brand-100 disabled:opacity-60 rounded-2xl p-4 text-left transition-colors"
          >
            <span>
              <span className="block text-sm font-semibold text-gray-900">Mensile</span>
              <span className="block text-xs text-gray-500">€4,99/mese</span>
            </span>
            {pendingPlan === 'monthly' && isBusy
              ? <Loader2 size={18} className="animate-spin text-brand-600" />
              : <span className="text-brand-700 text-sm font-semibold">Scegli</span>}
          </button>

          <button
            onClick={() => choosePlan('yearly')}
            disabled={isBusy}
            className="w-full flex items-center justify-between bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-2xl p-4 text-left transition-colors"
          >
            <span>
              <span className="block text-sm font-semibold">Annuale <span className="font-normal opacity-80">(-42%)</span></span>
              <span className="block text-xs opacity-80">€34,99/anno · ~€2,92/mese</span>
            </span>
            {pendingPlan === 'yearly' && isBusy
              ? <Loader2 size={18} className="animate-spin" />
              : <span className="text-sm font-semibold">Scegli</span>}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Verrai reindirizzato a PayPal per completare il pagamento.
        </p>
      </div>
    </div>,
    document.body,
  )
}
