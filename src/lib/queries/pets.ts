import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import type { Database } from '@/types/database.types'
import type { Species, Sex } from '@/lib/species'

type PetRow = Database['public']['Tables']['pets']['Row']

// species/sex nel DB sono TEXT + CHECK → override con union locali
export type Pet       = Omit<PetRow, 'species' | 'sex'> & { species: Species; sex: Sex }
export type PetInsert = Database['public']['Tables']['pets']['Insert']
export type PetUpdate = Database['public']['Tables']['pets']['Update']

const KEYS = {
  all:    ['pets'] as const,
  detail: (id: string) => ['pets', id] as const,
}

// ── Queries ──────────────────────────────────────────────

export function usePets() {
  const user = useAuthStore(s => s.user)
  return useQuery({
    queryKey: KEYS.all,
    enabled:  !!user,
    queryFn:  async (): Promise<Pet[]> => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Pet[]
    },
  })
}

export function usePet(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.detail(id ?? ''),
    enabled:  !!id,
    queryFn:  async (): Promise<Pet> => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Pet
    },
  })
}

// ── Mutations ────────────────────────────────────────────

export function useCreatePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<PetInsert, 'owner_id' | 'is_active'>): Promise<Pet> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non autenticato')
      const { data, error } = await supabase
        .from('pets')
        .insert({ ...input, owner_id: user.id, is_active: true })
        .select()
        .single()
      if (error) throw error
      return data as Pet
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useUpdatePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: PetUpdate & { id: string }): Promise<Pet> => {
      const { data, error } = await supabase
        .from('pets')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Pet
    },
    onSuccess: (pet) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(pet.id) })
    },
  })
}

// Soft delete: is_active = false, i dati sanitari restano recuperabili
export function useDeletePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('pets')
        .update({ is_active: false })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

// ── Foto: bucket privato → signed URL ───────────────────

// Path canonico: {user_id}/{uuid}.{ext} — richiesto dalle RLS storage
export async function uploadPetPhoto(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autenticato')

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('pet-photos')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return path
}

export function usePetPhotoUrl(path: string | null) {
  return useQuery({
    queryKey:  ['pet-photo', path],
    enabled:   !!path,
    staleTime: 1000 * 60 * 50, // signed URL 1h → refresh a 50min
    queryFn:   async (): Promise<string> => {
      const { data, error } = await supabase.storage
        .from('pet-photos')
        .createSignedUrl(path!, 3600)
      if (error) throw error
      return data.signedUrl
    },
  })
}
