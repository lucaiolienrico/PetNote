import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface AdminMetrics {
  totals: {
    users:      number
    pets:       number
    activePets: number
  }
  plan: {
    free:    number
    premium: number
    admin:   number
  }
  subscriptions: {
    active:           number
    cancelled:        number
    expired:          number
    mrrEstimate:      number
    currency:         string
    unknownPlanCount: number
  }
  recentUsers: Array<{
    id:                 string
    email:              string
    plan:               string
    subscriptionStatus: string | null
    createdAt:          string
  }>
}

// Nessuna cache lunga: dashboard admin, i numeri devono essere freschi ad
// ogni apertura. staleTime basso invece di 0 per evitare doppia chiamata
// se il componente rimonta rapidamente (StrictMode dev).
export function useAdminMetrics(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin-metrics'],
    enabled,
    queryFn: async (): Promise<AdminMetrics> => {
      const { data, error } = await supabase.functions.invoke<AdminMetrics>('admin-metrics', {
        method: 'POST',
      })
      if (error) throw error
      if (!data) throw new Error('Risposta vuota da admin-metrics')
      return data
    },
    staleTime: 30_000,
    retry: false, // 403/401 non vanno ritentati
  })
}
