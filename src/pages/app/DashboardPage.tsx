import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { usePets } from '@/lib/queries/pets'
import { PetCard } from '@/components/pets/PetCard'

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
        <Link
          to="/app/pets/new"
          className="flex items-center justify-center gap-2 bg-white rounded-2xl border-2 border-dashed border-brand-200 p-6 text-brand-600 text-sm font-semibold"
        >
          <Plus size={18} /> Aggiungi il tuo primo animale
        </Link>
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
