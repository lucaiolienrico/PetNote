import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type VetVisit       = Database['public']['Tables']['vet_visits']['Row']
export type VetVisitInsert = Database['public']['Tables']['vet_visits']['Insert']
export type VetVisitUpdate = Database['public']['Tables']['vet_visits']['Update']

const KEYS = { list: (petId: string) => ['vet_visits', petId] as const }

export function useVetVisits(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<VetVisit[]> => {
      const { data, error } = await supabase
        .from('vet_visits')
        .select('*')
        .eq('pet_id', petId!)
        .order('visited_at', { ascending: false }) // log storico → più recente in cima
      if (error) throw error
      return data
    },
  })
}

export function useCreateVetVisit(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<VetVisitInsert, 'pet_id'>) => {
      const { data, error } = await supabase
        .from('vet_visits')
        .insert({ ...input, pet_id: petId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

export function useUpdateVetVisit(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: VetVisitUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('vet_visits')
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

export function useDeleteVetVisit(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vet_visits').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
