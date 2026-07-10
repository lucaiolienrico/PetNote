import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface SharedPet {
  id:         string
  name:       string
  species:    string
  breed:      string | null
  sex:        string
  birth_date: string | null
  microchip:  string | null
  photo_url:  string | null
}
export interface SharedVaccination {
  id: string; vaccine_name: string; administered_at: string
  veterinarian: string | null; next_due_at: string | null; notes: string | null
}
export interface SharedVetVisit {
  id: string; visited_at: string; clinic: string | null
  veterinarian: string | null; reason: string; diagnosis: string | null
}
export interface SharedAntiparasitic {
  id: string; product_name: string; type: string
  administered_at: string; next_due_at: string | null
}
export interface SharedWeightLog { id: string; weight_kg: number; measured_at: string }
export interface SharedAllergy {
  id: string; allergen: string; severity: string
  reaction: string | null; diagnosed_at: string | null
}
export interface SharedMedication {
  id: string; drug_name: string; dosage: string | null
  frequency: string | null; start_date: string; end_date: string | null
}
export interface SharedHealthEvent {
  id: string; event_type: string; occurred_at: string; description: string | null
}

export interface SharedPetData {
  pet:            SharedPet
  vaccinations:   SharedVaccination[]
  vetVisits:      SharedVetVisit[]
  antiparasitics: SharedAntiparasitic[]
  weightLogs:     SharedWeightLog[]
  allergies:      SharedAllergy[]
  medications:    SharedMedication[]
  healthEvents:   SharedHealthEvent[]
}

export type SharedPetError = 'not_found' | 'expired' | 'unknown'

interface SharedPetResult {
  data:  SharedPetData | null
  error: SharedPetError | null
}

// L'Edge Function torna sempre status 200 per gli stati "attesi"
// (not_found/expired) con un body { error }, per evitare l'ambiguità tra
// FunctionsHttpError (transport) e stato applicativo lato supabase-js.
// Per questo non lanciamo mai su quei casi: sono risultati validi, non
// eccezioni — react-query non deve ritentarli né trattarli come errori.
export function useSharedPetData(token: string | undefined) {
  return useQuery({
    queryKey: ['shared-pet', token],
    enabled:  !!token,
    retry:    false,
    queryFn:  async (): Promise<SharedPetResult> => {
      const { data, error } = await supabase.functions.invoke<
        SharedPetData | { error: string }
      >('get-shared-pet-data', { body: { token } })

      if (error) return { data: null, error: 'unknown' }
      if (data && 'error' in data) {
        const e = data.error
        return { data: null, error: e === 'not_found' || e === 'expired' ? e : 'unknown' }
      }
      return { data: data as SharedPetData, error: null }
    },
  })
}
