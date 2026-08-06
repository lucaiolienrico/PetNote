import { Link } from 'react-router-dom'
import { Plus, PawPrint, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { usePets } from '@/lib/queries/pets'
import { PetCard } from '@/components/pets/PetCard'

const ONBOARDING_BENEFITS = [
  'Vaccinazioni e richiami sempre sotto controllo',
  'Storico visite, peso e trattamenti in un tap',
  'Condividi il libretto col veterinario senza stampare nulla',
]

export function DashboardPage() {
  const profile = useAuthStore(s => s.profile)
  const { data: pets, isLoading } = usePets()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Ciao{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-sm text-slate-600">Come stanno i tuoi animali?</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          profile?.plan === 'premium'
            ? 'bg-brand-100 text-brand-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {profile?.plan === 'premium' ? '⭐ Premium' : 'Free'}
        </span>
      </div>

      {isLoading && <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />}

      {!isLoading && pets?.length === 0 && (
        <div className="bg-gradient-to-br from-brand-50 to-white rounded-3xl border border-brand-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <PawPrint size={24} className="text-brand-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Inizia con il tuo primo animale</p>
              <p className="text-sm text-slate-500">Ci vuole meno di un minuto.</p>
            </div>
          </div>

          <ul className="space-y-2.5">
            {ONBOARDING_BENEFITS.map(benefit => (
              <li key={benefit} className="flex items-center gap-2.5 text-sm text-slate-600">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                  <Check size={11} className="text-brand-700" strokeWidth={3} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <Link
            to="/app/pets/new"
            className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white rounded-2xl p-4 text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> Aggiungi il tuo animale
          </Link>
        </div>
      )}

      {!isLoading && !!pets?.length && (
        <div className="space-y-3">
          {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
        </div>
      )}

      {/* Prossime scadenze — popolato da passaggi 7-10 (vaccini/antiparassitari) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-sm font-semibold text-slate-900 mb-1">Prossime scadenze</p>
        <p className="text-xs text-slate-500">Nessuna scadenza — aggiungi vaccini e trattamenti</p>
      </div>
    </div>
  )
}
