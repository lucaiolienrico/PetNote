import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Elimina definitivamente l'account (hard delete, nessun grace period).
 * La Edge Function gestisce in ordine: blocco se admin, cancellazione
 * PayPal sincrona se l'abbonamento è attivo, pulizia Storage (pet-photos +
 * pet-documents), poi auth.admin.deleteUser() — la cascata FK elimina
 * tutte le tabelle figlie (pets, vaccinations, medications, documents, ecc.).
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke<{ message: string }>(
        'delete-account',
        { body: {} }
      )
      if (error) throw error
      return data
    },
  })
}
