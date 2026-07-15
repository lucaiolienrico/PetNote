import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'
import { uploadPetPhoto } from '@/lib/queries/pets'

export type PetPhoto = Database['public']['Tables']['pet_photos']['Row']

// Allineati al bucket pet-photos (5MB, mime whitelist lato Storage):
// validare anche client-side evita un upload destinato a fallire a metà.
export const MAX_PHOTO_BYTES  = 5 * 1024 * 1024
export const ACCEPTED_PHOTO_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const KEYS = {
  list: (petId: string) => ['pet-photos', petId] as const,
  urls: (key: string)   => ['pet-photo-urls', key] as const,
}

export function usePetPhotos(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<PetPhoto[]> => {
      const { data, error } = await supabase
        .from('pet_photos')
        .select('*')
        .eq('pet_id', petId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

// Un solo round-trip per N path invece di N createSignedUrl separate.
// La query key è derivata dai path ordinati: cambia solo se cambia l'insieme.
export function usePetPhotoUrls(paths: string[]) {
  const key = [...paths].sort().join('|')
  return useQuery({
    queryKey:  KEYS.urls(key),
    enabled:   paths.length > 0,
    staleTime: 1000 * 60 * 50, // signed URL 1h → refresh a 50min
    queryFn:   async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.storage
        .from('pet-photos')
        .createSignedUrls(paths, 3600)
      if (error) throw error
      const map: Record<string, string> = {}
      for (const item of data) {
        if (item.path && item.signedUrl) map[item.path] = item.signedUrl
      }
      return map
    },
  })
}

// Upload + insert non sono atomici: se l'insert fallisce il file resta orfano
// nel bucket e conta sulla quota → rollback esplicito dello storage.
export function useAddPetPhoto(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File): Promise<PetPhoto> => {
      if (file.size > MAX_PHOTO_BYTES) throw new Error('Foto troppo grande (max 5 MB)')
      if (!ACCEPTED_PHOTO_MIME.includes(file.type)) throw new Error('Formato non supportato (JPEG, PNG, WEBP, GIF)')

      const path = await uploadPetPhoto(file)
      const { data, error } = await supabase
        .from('pet_photos')
        .insert({ pet_id: petId, storage_path: path })
        .select()
        .single()
      if (error) {
        await supabase.storage.from('pet-photos').remove([path])
        throw error
      }
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

// Riga prima, file dopo: un file orfano nel bucket è meno grave di un record
// fantasma nella UI (stesso razionale di useDeleteDocument).
export function useDeletePetPhoto(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, storage_path }: { id: string; storage_path: string }): Promise<void> => {
      const { error } = await supabase.from('pet_photos').delete().eq('id', id)
      if (error) throw error
      await supabase.storage.from('pet-photos').remove([storage_path])
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
