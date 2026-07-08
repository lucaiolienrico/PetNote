import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type InsurancePolicy       = Database['public']['Tables']['insurance_policies']['Row']
export type InsurancePolicyInsert = Database['public']['Tables']['insurance_policies']['Insert']
export type InsurancePolicyUpdate = Database['public']['Tables']['insurance_policies']['Update']

const KEYS = { list: (petId: string) => ['insurance_policies', petId] as const }

export function useInsurancePolicies(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<InsurancePolicy[]> => {
      const { data, error } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('pet_id', petId!)
        .order('start_date', { ascending: false }) // storico polizze → più recente in cima
      if (error) throw error
      return data
    },
  })
}

export function useCreateInsurancePolicy(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<InsurancePolicyInsert, 'pet_id'>) => {
      const { data, error } = await supabase
        .from('insurance_policies')
        .insert({ ...input, pet_id: petId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

export function useUpdateInsurancePolicy(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: InsurancePolicyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('insurance_policies')
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

export function useDeleteInsurancePolicy(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('insurance_policies').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
