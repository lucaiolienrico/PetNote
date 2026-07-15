import { useRef, useState } from 'react'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  usePetPhotos, usePetPhotoUrls, useAddPetPhoto, useDeletePetPhoto,
  ACCEPTED_PHOTO_MIME,
} from '@/lib/queries/petPhotos'
import { useConfirmTap } from '@/hooks/useConfirmTap'

interface Props {
  petId:    string
  petName:  string
  photoUrl: string | null | undefined // signed URL della foto profilo (pets.photo_url)
}

// Un tile per foto profilo (non eliminabile da qui: si gestisce da PetForm) +
// un tile per ogni riga pet_photos + il tile "Aggiungi" sempre in coda.
interface Tile {
  key:   string
  url:   string | undefined
  id:    string | null   // null = foto profilo → nessuna delete
  path:  string | null
}

export function PhotoGallery({ petId, petName, photoUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [viewer, setViewer] = useState<Tile | null>(null)
  const { tap, isArmed }    = useConfirmTap()

  const { data: photos = [], isLoading } = usePetPhotos(petId)
  const paths = photos.map(p => p.storage_path)
  const { data: urls = {} }  = usePetPhotoUrls(paths)

  const addPhoto    = useAddPetPhoto(petId)
  const deletePhoto = useDeletePetPhoto(petId)

  const tiles: Tile[] = [
    ...(photoUrl ? [{ key: 'avatar', url: photoUrl, id: null, path: null }] : []),
    ...photos.map(p => ({ key: p.id, url: urls[p.storage_path], id: p.id, path: p.storage_path })),
  ]
  const count = tiles.length

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // consente di ricaricare lo stesso file dopo un errore
    if (!file) return
    try {
      await addPhoto.mutateAsync(file)
      toast.success('Foto aggiunta')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload fallito')
    }
  }

  const onDelete = (tile: Tile) => {
    if (!tile.id || !tile.path) return
    const { id, path } = tile
    tap(id, async () => {
      try {
        await deletePhoto.mutateAsync({ id, storage_path: path })
        setViewer(null)
        toast.success('Foto eliminata')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Eliminazione fallita')
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-slate-900">Le foto di {petName}</p>
        <span className="text-xs text-slate-400">{count} {count === 1 ? 'foto' : 'foto'}</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_PHOTO_MIME.join(',')}
        onChange={onPick}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-2">
        {tiles.map(tile => (
          <button
            key={tile.key}
            type="button"
            onClick={() => tile.url && setViewer(tile)}
            className="aspect-square rounded-xl overflow-hidden bg-slate-100 active:opacity-80 transition-opacity"
            aria-label={`Apri foto di ${petName}`}
          >
            {tile.url ? (
              <img src={tile.url} alt={`Foto di ${petName}`} className="w-full h-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center">
                <Loader2 size={16} className="animate-spin text-slate-300" />
              </span>
            )}
          </button>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={addPhoto.isPending || isLoading}
          className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-blue-300 hover:text-blue-500 active:bg-slate-50 transition-colors disabled:opacity-50"
          aria-label="Aggiungi foto"
        >
          {addPhoto.isPending
            ? <Loader2 size={20} className="animate-spin" />
            : <><Plus size={20} /><span className="text-xs font-medium">Aggiungi</span></>}
        </button>
      </div>

      {/* Viewer full-screen. z-50 > z-40 della CTA PDF di PetDetailPage. */}
      {viewer?.url && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex justify-end gap-2 p-3">
            {viewer.id && (
              <button
                type="button"
                onClick={() => onDelete(viewer)}
                disabled={deletePhoto.isPending}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  isArmed(viewer.id) ? 'bg-red-600 text-white' : 'bg-white/10 text-white'
                }`}
              >
                <Trash2 size={16} />
                {isArmed(viewer.id) ? 'Conferma' : 'Elimina'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setViewer(null)}
              className="rounded-xl bg-white/10 p-2 text-white"
              aria-label="Chiudi"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 pb-8">
            <img src={viewer.url} alt={`Foto di ${petName}`} className="max-h-full max-w-full object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  )
}
