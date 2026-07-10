import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type Medication       = Database['public']['Tables']['medications']['Row']
export type MedicationInsert = Database['public']['Tables']['medications']['Insert']
export type MedicationUpdate = Database['public']['Tables']['medications']['Update']

const KEYS = { list: (petId: string) => ['medications', petId] as const }

export function useMedications(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<Medication[]> => {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('pet_id', petId!)
        .order('start_date', { ascending: false }) // storico terapie → più recente in cima
      if (error) throw error
      return data
    },
  })
}

export function useCreateMedication(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<MedicationInsert, 'pet_id'>) => {
      const { data, error } = await supabase
        .from('medications')
        .insert({ ...input, pet_id: petId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

export function useUpdateMedication(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: MedicationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('medications')
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

export function useDeleteMedication(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('medications').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
