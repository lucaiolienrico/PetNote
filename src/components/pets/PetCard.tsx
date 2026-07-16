import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { SPECIES, petAge } from '@/lib/species'
import { usePetPhotoUrl, type Pet } from '@/lib/queries/pets'
import { ExportPdfButton } from '@/components/pets/ExportPdfButton'

export function PetCard({ pet }: { pet: Pet }) {
  const { data: photoUrl } = usePetPhotoUrl(pet.photo_url)
  const meta = [SPECIES[pet.species].label, pet.breed, petAge(pet.birth_date)]
    .filter(Boolean)
    .join(' · ')

  // Card non più wrappata da un unico <Link>: l'export è un <button> e non può
  // stare dentro un <a> (HTML invalido). Link limitato a foto+testo+chevron,
  // ExportPdfButton come elemento fratello → export disponibile dalla dashboard
  // senza entrare nel dettaglio, sia per admin sia per utente (nessun gate).
  return (
    <div className="flex items-center gap-1 bg-white rounded-2xl border border-slate-100 p-3.5">
      <Link
        to={`/app/pets/${pet.id}`}
        className="flex items-center gap-3 flex-1 min-w-0 active:opacity-70 transition-opacity"
      >
        <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {photoUrl
            ? <img src={photoUrl} alt={pet.name} className="w-full h-full object-cover" />
            : <span className="text-2xl">{SPECIES[pet.species].emoji}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{pet.name}</p>
          <p className="text-xs text-slate-600 truncate">{meta}</p>
        </div>
      </Link>

      <ExportPdfButton pet={pet} />

      <Link to={`/app/pets/${pet.id}`} aria-label={`Apri ${pet.name}`} className="flex-shrink-0">
        <ChevronRight size={18} className="text-slate-300" />
      </Link>
    </div>
  )
}
