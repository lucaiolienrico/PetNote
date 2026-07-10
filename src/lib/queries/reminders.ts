import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

export type Reminder       = Database['public']['Tables']['reminders']['Row']
export type ReminderInsert = Database['public']['Tables']['reminders']['Insert']
export type ReminderUpdate = Database['public']['Tables']['reminders']['Update']

const KEYS = { list: (petId: string) => ['reminders', petId] as const }

export function useReminders(petId: string | undefined) {
  return useQuery({
    queryKey: KEYS.list(petId ?? ''),
    enabled:  !!petId,
    queryFn:  async (): Promise<Reminder[]> => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('pet_id', petId!)
        .order('due_date', { ascending: true }) // più imminenti in cima
      if (error) throw error
      return data
    },
  })
}

export function useCreateReminder(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<ReminderInsert, 'pet_id'>) => {
      const { data, error } = await supabase
        .from('reminders')
        .insert({ ...input, pet_id: petId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}

export function useUpdateReminder(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: ReminderUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('reminders')
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

export function useDeleteReminder(petId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reminders').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.list(petId) }),
  })
}
