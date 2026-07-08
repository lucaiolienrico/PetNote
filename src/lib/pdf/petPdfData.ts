import { supabase } from '@/lib/supabase'
import type { Vaccination } from '@/lib/queries/vaccinations'
import type { VetVisit } from '@/lib/queries/vetVisits'
import type { Antiparasitic } from '@/lib/queries/antiparasitics'
import type { WeightLog } from '@/lib/queries/weightLogs'
import type { Allergy } from '@/lib/queries/allergies'
import type { InsurancePolicy } from '@/lib/queries/insurance'

export interface PetPdfData {
  vaccinations: Vaccination[]
  vetVisits: VetVisit[]
  antiparasitics: Antiparasitic[]
  weightLogs: WeightLog[]
  allergies: Allergy[]
  insurancePolicies: InsurancePolicy[]
}

// Export PDF è un'azione one-shot: niente cache, niente re-render, niente invalidation.
// Query dirette a Supabase invece degli hook TanStack Query — stesso ordinamento delle
// rispettive pagine per coerenza, ma senza legare il fetch al ciclo di vita del componente.
// RLS (ownership transitiva via pets.owner_id) protegge comunque l'accesso ai dati.
export async function fetchPetPdfData(petId: string): Promise<PetPdfData> {
  const [vaccinations, vetVisits, antiparasitics, weightLogs, allergies, insurancePolicies] =
    await Promise.all([
      supabase
        .from('vaccinations')
        .select('*')
        .eq('pet_id', petId)
        .order('next_due_at', { ascending: true, nullsFirst: false })
        .order('administered_at', { ascending: false }),
      supabase
        .from('vet_visits')
        .select('*')
        .eq('pet_id', petId)
        .order('visited_at', { ascending: false }),
      supabase
        .from('antiparasitics')
        .select('*')
        .eq('pet_id', petId)
        .order('next_due_at', { ascending: true, nullsFirst: false })
        .order('administered_at', { ascending: false }),
      supabase
        .from('weight_logs')
        .select('*')
        .eq('pet_id', petId)
        .order('measured_at', { ascending: false }),
      supabase
        .from('allergies')
        .select('*')
        .eq('pet_id', petId)
        .order('diagnosed_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('insurance_policies')
        .select('*')
        .eq('pet_id', petId)
        .order('start_date', { ascending: false }),
    ])

  // Fail-fast: un solo errore invalida l'intero export — meglio un errore visibile
  // che un PDF con sezioni silenziosamente vuote per un fallimento di rete.
  for (const result of [vaccinations, vetVisits, antiparasitics, weightLogs, allergies, insurancePolicies]) {
    if (result.error) throw result.error
  }

  return {
    vaccinations: vaccinations.data ?? [],
    vetVisits: vetVisits.data ?? [],
    antiparasitics: antiparasitics.data ?? [],
    weightLogs: weightLogs.data ?? [],
    allergies: allergies.data ?? [],
    insurancePolicies: insurancePolicies.data ?? [],
  }
}
