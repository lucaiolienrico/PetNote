import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { FREE_LIMITS, PlanLimitError } from '@/lib/planLimits'
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

// hasFullAccess: passato dal chiamante (useAuthStore/selectHasFullAccess).
// Il check qui è enforcement applicativo reale, non solo un guard sul
// bottone "Aggiungi" — chi bypassa la UI e chiama la mutation direttamente
// trova comunque il limite. RLS resta ownership-only (nessun constraint DB
// sul conteggio): questa è quindi l'unica barriera, non difesa in profondità.
export function useCreateVetVisit(petId: string, hasFullAccess: boolean) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<VetVisitInsert, 'pet_id'>) => {
      if (!hasFullAccess) {
        const { count, error: countError } = await supabase
          .from('vet_visits')
          .select('id', { count: 'exact', head: true })
          .eq('pet_id', petId)
        if (countError) throw countError
        if ((count ?? 0) >= FREE_LIMITS.vetVisitsPerPet) {
          throw new PlanLimitError(
            `Piano Free: massimo ${FREE_LIMITS.vetVisitsPerPet} visite per animale. Passa a Premium per aggiungerne altre.`
          )
        }
      }
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
