import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { FREE_LIMITS, PlanLimitError } from '@/lib/planLimits'
import type { Database } from '@/types/database.types'

export type Vaccination       = Database['public']['Tables']['vaccinations']['Row']
export type VaccinationInsert = Database['public']['Tables']['vaccinations']['Insert']
export type VaccinationUpdate = Database['public']['Tables']['vaccinations']['Update']

const KEYS = { list: (petId: string) => ['vaccinations', petId] as const }

export function useVaccinations(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<Vaccination[]> => {
      const { data, error } = await supabase
        .from('vaccinations')
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

// hasFullAccess: passato dal chiamante (useAuthStore/selectHasFullAccess).
// Il check qui è enforcement applicativo reale, non solo un guard sul bottone
// "Aggiungi" — chi bypassa la UI e chiama la mutation direttamente trova
// comunque il limite. RLS resta ownership-only (nessun constraint DB sul
// conteggio): questa è quindi l'unica barriera, non difesa in profondità.
export function useCreateVaccination(petId: string, hasFullAccess: boolean) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<VaccinationInsert, 'pet_id'>) => {
      if (!hasFullAccess) {
        const { count, error: countError } = await supabase
          .from('vaccinations')
          .select('id', { count: 'exact', head: true })
          .eq('pet_id', petId)
        if (countError) throw countError
        if ((count ?? 0) >= FREE_LIMITS.vaccinationsPerPet) {
          throw new PlanLimitError(
            `Piano Free: massimo ${FREE_LIMITS.vaccinationsPerPet} vaccinazioni per animale. Passa a Premium per aggiungerne altre.`
          )
        }
      }
      const { data, error } = await supabase
        .from('vaccinations')
        .insert({ ...input, pet_id: petId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

export function useUpdateVaccination(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: VaccinationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('vaccinations')
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

export function useDeleteVaccination(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vaccinations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
