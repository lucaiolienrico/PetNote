import { useNavigate } from 'react-router-dom'
import { PawPrint, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useUpdateProfile } from '@/lib/queries/profile'

// Welcome screen mostrato una sola volta al primo accesso (profile.onboarding_completed
// = false). Backfillato a true per gli utenti già esistenti alla migrazione — vedi
// add_onboarding_completed_to_profiles. Stesso pattern visivo di UpgradeModal.tsx
// (bottom-sheet mobile, bg-black/50, rounded-t-3xl) per coerenza col design system.

const STEPS = [
  'Aggiungi il tuo animale in meno di un minuto',
  'Registra vaccinazioni, visite e peso nel tempo',
  'Ricevi un promemoria prima di ogni scadenza',
]

export function OnboardingWelcome() {
  const navigate = useNavigate()
  const profile = useAuthStore(s => s.profile)
  const updateProfile = useUpdateProfile()

  if (!profile || profile.onboarding_completed) return null

  const isBusy = updateProfile.isPending

  const dismiss = () => {
    updateProfile.mutate({ onboarding_completed: true })
  }

  const start = () => {
    updateProfile.mutate({ onboarding_completed: true })
    navigate('/app/pets/new')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center">
            <PawPrint size={26} className="text-brand-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Benvenuto su PetNote 🐾</h2>
            <p className="text-sm text-slate-500 mt-1">
              Tutta la salute dei tuoi animali, in un posto solo.
            </p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {STEPS.map(step => (
            <li key={step} className="flex items-center gap-2.5 text-sm text-slate-700">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                <Check size={12} className="text-brand-700" strokeWidth={3} />
              </span>
              {step}
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <button
            onClick={start}
            disabled={isBusy}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-2xl p-4 text-sm font-semibold transition-colors"
          >
            Aggiungi il tuo primo animale
          </button>
          <button
            onClick={dismiss}
            disabled={isBusy}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 disabled:opacity-60 py-1"
          >
            Esplora da solo
          </button>
        </div>
      </div>
    </div>
  )
}
