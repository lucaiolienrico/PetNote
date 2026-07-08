import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

type PlanKey = 'monthly' | 'yearly'

interface CreateSubscriptionResponse {
  approvalUrl: string
  subscriptionId: string
}

/**
 * Avvia il checkout PayPal: chiama l'Edge Function, poi reindirizza il
 * browser all'approvalUrl. Redirect esplicito (window.location), non
 * React Router — usciamo dalla SPA verso PayPal.
 */
export function useCreateSubscription() {
  return useMutation({
    mutationFn: async (plan: PlanKey) => {
      const { data, error } = await supabase.functions.invoke<CreateSubscriptionResponse>(
        'create-paypal-subscription',
        { body: { plan } }
      )
      if (error) throw error
      if (!data?.approvalUrl) throw new Error('PayPal non ha restituito un link di approvazione')
      return data
    },
    onSuccess: (data) => {
      window.location.href = data.approvalUrl
    },
  })
}

/**
 * Cancella la subscription attiva. Non tocca il DB lato client — il
 * webhook BILLING.SUBSCRIPTION.CANCELLED resta la fonte di verità.
 */
export function useCancelSubscription() {
  return useMutation({
    mutationFn: async (reason?: string) => {
      const { data, error } = await supabase.functions.invoke<{ message: string }>(
        'cancel-paypal-subscription',
        { body: reason ? { reason } : {} }
      )
      if (error) throw error
      return data
    },
  })
}
