import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type ShareLink = Database['public']['Tables']['share_links']['Row']

const KEYS = { list: (petId: string) => ['share-links', petId] as const }

export function useShareLinks(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<ShareLink[]> => {
      const { data, error } = await supabase
        .from('share_links')
        .select('*')
        .eq('pet_id', petId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

// expiresAt: null = link senza scadenza. Il token viene generato lato DB
// (default gen_random_bytes) — non lo passiamo mai dal client.
export function useCreateShareLink(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (expiresAt: string | null) => {
      const { data, error } = await supabase
        .from('share_links')
        .insert({ pet_id: petId, expires_at: expiresAt })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

export function useDeleteShareLink(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('share_links').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
