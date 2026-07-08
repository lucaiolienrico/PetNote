import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type Allergy       = Database['public']['Tables']['allergies']['Row']
export type AllergyInsert = Database['public']['Tables']['allergies']['Insert']
export type AllergyUpdate = Database['public']['Tables']['allergies']['Update']

const KEYS = { list: (petId: string) => ['allergies', petId] as const }

export function useAllergies(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<Allergy[]> => {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('pet_id', petId!)
        // Log storico (non ricorrente, no next_due_at) → più recente in cima, come vet_visits
        .order('diagnosed_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateAllergy(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<AllergyInsert, 'pet_id'>) => {
      const { data, error } = await supabase
        .from('allergies')
        .insert({ ...input, pet_id: petId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

export function useUpdateAllergy(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: AllergyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('allergies')
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

export function useDeleteAllergy(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('allergies').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
