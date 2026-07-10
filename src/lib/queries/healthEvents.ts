import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type HealthEvent       = Database['public']['Tables']['health_events']['Row']
export type HealthEventInsert = Database['public']['Tables']['health_events']['Insert']
export type HealthEventUpdate = Database['public']['Tables']['health_events']['Update']

const KEYS = { list: (petId: string) => ['health_events', petId] as const }

export function useHealthEvents(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<HealthEvent[]> => {
      const { data, error } = await supabase
        .from('health_events')
        .select('*')
        .eq('pet_id', petId!)
        .order('occurred_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateHealthEvent(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<HealthEventInsert, 'pet_id'>) => {
      const { data, error } = await supabase
        .from('health_events')
        .insert({ ...input, pet_id: petId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

export function useUpdateHealthEvent(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: HealthEventUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('health_events')
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

export function useDeleteHealthEvent(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('health_events').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
