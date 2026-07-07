import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { SPECIES, petAge } from '@/lib/species'
import { usePetPhotoUrl, type Pet } from '@/lib/queries/pets'

export function PetCard({ pet }: { pet: Pet }) {
  const { data: photoUrl } = usePetPhotoUrl(pet.photo_url)
  const meta = [SPECIES[pet.species].label, pet.breed, petAge(pet.birth_date)]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link
      to={`/app/pets/${pet.id}`}
      className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 active:bg-gray-50 transition-colors"
    >
      <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        {photoUrl
          ? <img src={photoUrl} alt={pet.name} className="w-full h-full object-cover" />
          : <span className="text-2xl">{SPECIES[pet.species].emoji}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{pet.name}</p>
        <p className="text-xs text-gray-500 truncate">{meta}</p>
      </div>
      <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
    </Link>
  )
}
