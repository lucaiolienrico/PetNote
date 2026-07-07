import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import type { Database } from '@/types/database.types'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Aggiorna profilo + sincronizza lo store Zustand (fonte verità sessione)
export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: ProfileUpdate) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non autenticato')
      const { data, error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (profile) => {
      useAuthStore.setState({ profile })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
