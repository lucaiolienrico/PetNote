import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type Antiparasitic       = Database['public']['Tables']['antiparasitics']['Row']
export type AntiparasiticInsert = Database['public']['Tables']['antiparasitics']['Insert']
export type AntiparasiticUpdate = Database['public']['Tables']['antiparasitics']['Update']

const KEYS = { list: (petId: string) => ['antiparasitics', petId] as const }

export function useAntiparasitics(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<Antiparasitic[]> => {
      const { data, error } = await supabase
        .from('antiparasitics')
        .select('*')
        .eq('pet_id', petId!)
        // NULL prima (nessuna scadenza) poi le più imminenti — riflette priorità visiva reminder
        .order('next_due_at', { ascending: true, nullsFirst: false })
        .order('administered_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateAntiparasitic(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<AntiparasiticInsert, 'pet_id'>) => {
      const { data, error } = await supabase
        .from('antiparasitics')
        .insert({ ...input, pet_id: petId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

export function useUpdateAntiparasitic(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: AntiparasiticUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('antiparasitics')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

export function useDeleteAntiparasitic(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('antiparasitics').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
