import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthStore {
  user:       User | null
  profile:    Profile | null
  loading:    boolean
  initialize: () => Promise<void>
  signOut:    () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:    null,
  profile: null,
  loading: true,

  initialize: async () => {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      set({ user: session.user, profile, loading: false })
    } else {
      set({ user: null, profile: null, loading: false })
    }

    // Subscribe to auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        set({ user: session.user, profile, loading: false })
      } else {
        set({ user: null, profile: null, loading: false })
      }
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))

// Derived selectors
export const selectIsPremium = (s: AuthStore) =>
  s.profile?.plan === 'premium' &&
  s.profile?.subscription_status === 'active'

export const selectIsAdmin = (s: AuthStore) =>
  s.user?.email === 'lucaiolienrico@gmail.com' &&
  s.profile?.is_admin === true
