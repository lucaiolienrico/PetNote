import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type WeightLog       = Database['public']['Tables']['weight_logs']['Row']
export type WeightLogInsert = Database['public']['Tables']['weight_logs']['Insert']
export type WeightLogUpdate = Database['public']['Tables']['weight_logs']['Update']

const KEYS = { list: (petId: string) => ['weight_logs', petId] as const }

export function useWeightLogs(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<WeightLog[]> => {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('pet_id', petId!)
        // DESC: sfrutta idx_weight_pet_date(pet_id, measured_at DESC), più recente in cima nella lista
        .order('measured_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateWeightLog(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<WeightLogInsert, 'pet_id'>) => {
      const { data, error } = await supabase
        .from('weight_logs')
        .insert({ ...input, pet_id: petId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

export function useUpdateWeightLog(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: WeightLogUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('weight_logs')
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

export function useDeleteWeightLog(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('weight_logs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
