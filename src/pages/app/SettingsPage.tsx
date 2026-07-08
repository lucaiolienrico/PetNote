import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogOut, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, selectIsPremium } from '@/stores/auth.store'
import { useUpdateProfile } from '@/lib/queries/profile'
import { useCancelSubscription } from '@/lib/queries/subscription'
import { UpgradeModal } from '@/components/shared/UpgradeModal'
import { useConfirmTap } from '@/hooks/useConfirmTap'

const schema = z.object({
  full_name: z.string().trim().min(2, 'Nome troppo corto').max(80),
})
type FormData = z.infer<typeof schema>

const APP_VERSION = '0.1.0' // bump manuale ad ogni release — no build tool a leggerlo

export function SettingsPage() {
  const user               = useAuthStore(s => s.user)
  const profile             = useAuthStore(s => s.profile)
  const signOut             = useAuthStore(s => s.signOut)
  const refreshProfile      = useAuthStore(s => s.refreshProfile)
  const isPremium           = useAuthStore(selectIsPremium)
  const updateProfile       = useUpdateProfile()
  const cancelSubscription  = useCancelSubscription()

  const [searchParams, setSearchParams] = useSearchParams()
  const [editingName, setEditingName] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { tap, isArmed } = useConfirmTap()
  const confirmLogout = isArmed('logout')
  const confirmCancel = isArmed('cancel-subscription')

  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: profile?.full_name ?? '' },
  })

  // Ritorno dal checkout PayPal: il redirect è sincrono, l'attivazione
  // reale arriva via webhook async (paypal-webhook). Il profilo in
  // Zustand qui può essere ancora stale — rileggiamo con retry invece
  // di mostrare "Free" a chi ha appena pagato solo per timing.
  useEffect(() => {
    const subscriptionParam = searchParams.get('subscription')
    if (!subscriptionParam) return

    if (subscriptionParam === 'success') {
      toast.info('Pagamento ricevuto, stiamo attivando Premium…')

      let attempts = 0
      const maxAttempts = 4
      const poll = async () => {
        await refreshProfile()
        attempts += 1
        const active = useAuthStore.getState().profile?.subscription_status === 'active'
        if (active) {
          toast.success('Premium attivato!')
          return
        }
        if (attempts < maxAttempts) {
          setTimeout(poll, 1500)
        } else {
          toast.message(
            'Attivazione in corso, può richiedere qualche minuto. Ricarica la pagina più tardi se il piano non risulta ancora aggiornato.'
          )
        }
      }
      void poll()
    } else if (subscriptionParam === 'cancelled') {
      toast.info('Checkout PayPal annullato.')
    }

    // Pulisce il query param una tantum — senza questo un refresh manuale
    // della pagina rifarebbe partire il polling ad ogni reload.
    setSearchParams({}, { replace: true })
    // Effetto intenzionalmente single-run all'ingresso pagina.
    // eslint-disable-next-line
  }, [])

  const saveName = async (data: FormData) => {
    try {
      await updateProfile.mutateAsync({ full_name: data.full_name })
      toast.success('Nome aggiornato')
      setEditingName(false)
    } catch {
      toast.error('Salvataggio non riuscito')
    }
  }

  const cancelEdit = () => {
    reset({ full_name: profile?.full_name ?? '' })
    setEditingName(false)
  }

  const onLogout = () => tap('logout', () => { void signOut() })

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription.mutateAsync(undefined)
      toast.success('Cancellazione inviata. Il piano tornerà a Free a breve.')
      void refreshProfile()
    } catch {
      toast.error('Cancellazione non riuscita. Riprova o contatta il supporto.')
    }
  }

  const onManageSubscription = () => tap('cancel-subscription', () => { void handleCancelSubscription() })

  const renewalDate = profile?.subscription_expires_at
    ? new Date(profile.subscription_expires_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 pt-2">Impostazioni</h1>

      {/* Profilo */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg flex-shrink-0">
            {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <form onSubmit={handleSubmit(saveName)} className="flex items-center gap-1.5">
                <input
                  {...register('full_name')}
                  autoFocus
                  className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button type="submit" disabled={updateProfile.isPending} className="p-1.5 text-brand-600" aria-label="Salva">
                  <Check size={16} />
                </button>
                <button type="button" onClick={cancelEdit} className="p-1.5 text-gray-400" aria-label="Annulla">
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="flex items-center gap-1.5 font-semibold text-gray-900 truncate"
              >
                <span className="truncate">{profile?.full_name || 'Aggiungi nome'}</span>
                <Pencil size={13} className="text-gray-300 flex-shrink-0" />
              </button>
            )}
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Piano */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Il tuo piano</p>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            isPremium ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {isPremium ? '⭐ Premium' : 'Free'}
          </span>
        </div>

        {isPremium ? (
          <>
            {renewalDate && (
              <p className="text-xs text-gray-500">Rinnovo il {renewalDate}</p>
            )}
            <button
              onClick={onManageSubscription}
              disabled={cancelSubscription.isPending}
              className={`w-full border rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                confirmCancel
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cancelSubscription.isPending
                ? 'Cancellazione in corso…'
                : confirmCancel
                  ? 'Tocca di nuovo per confermare'
                  : 'Gestisci abbonamento'}
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowUpgrade(true)}
            className="w-full bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Passa a Premium — €4,99/mese
          </button>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors ${
          confirmLogout
            ? 'bg-red-50 text-red-600'
            : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
        }`}
      >
        <LogOut size={16} />
        {confirmLogout ? 'Tocca di nuovo per confermare' : 'Esci'}
      </button>

      <p className="text-center text-xs text-gray-300 pt-2">PetNote v{APP_VERSION}</p>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}
