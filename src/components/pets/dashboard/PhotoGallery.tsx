import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  petId:    string
  petName:  string
  photoUrl: string | null | undefined
}

export function PhotoGallery({ petId, petName, photoUrl }: Props) {
  const navigate = useNavigate()
  const photoCount = photoUrl ? 1 : 0

  // 3 display slots + 1 add button = 2×2 grid
  const slots: Array<string | null> = [photoUrl ?? null, null, null]

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-slate-900">Le foto di {petName}</p>
        <span className="text-xs text-slate-400">{photoCount} {photoCount === 1 ? 'foto' : 'foto'}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {slots.map((src, i) => (
          <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
            {src && (
              <img
                src={src}
                alt={`Foto ${i + 1} di ${petName}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => navigate(`/app/pets/${petId}/edit`)}
          className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-blue-300 hover:text-blue-500 active:bg-slate-50 transition-colors"
          aria-label="Aggiungi foto"
        >
          <Plus size={20} />
          <span className="text-xs font-medium">Aggiungi</span>
        </button>
      </div>
    </div>
  )
}
