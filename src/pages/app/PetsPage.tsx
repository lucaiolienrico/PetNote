import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, PawPrint } from 'lucide-react'
import { usePets } from '@/lib/queries/pets'
import { useAuthStore, selectIsPremium } from '@/stores/auth.store'
import { PetCard } from '@/components/pets/PetCard'
import { UpgradeModal } from '@/components/shared/UpgradeModal'

export function PetsPage() {
  const navigate  = useNavigate()
  const isPremium = useAuthStore(selectIsPremium)
  const { data: pets, isLoading } = usePets()
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Paywall: Free = max 1 pet
  const canAddPet = isPremium || (pets?.length ?? 0) < 1
  const onAdd = () => canAddPet ? navigate('/app/pets/new') : setShowUpgrade(true)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">I tuoi animali</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 bg-brand-600 text-white rounded-xl px-3.5 py-2 text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} /> Aggiungi
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {!isLoading && pets?.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-50 flex items-center justify-center">
            <PawPrint size={26} className="text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Nessun animale</p>
            <p className="text-sm text-gray-500 mt-1">Aggiungi il tuo primo amico a quattro zampe</p>
          </div>
          <button
            onClick={onAdd}
            className="bg-brand-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Aggiungi animale
          </button>
        </div>
      )}

      {!isLoading && !!pets?.length && (
        <div className="space-y-3">
          {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
        </div>
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}
