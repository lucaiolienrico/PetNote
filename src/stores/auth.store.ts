import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthStore {
  user:           User | null
  profile:        Profile | null
  loading:        boolean
  initialize:     () => Promise<void>
  signOut:        () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user:    null,
  profile: null,
  loading: true,

  initialize: async () => {
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

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: session.user, loading: false })
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          set({ profile })
        }, 0)
      } else {
        set({ user: null, profile: null, loading: false })
      }
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  // Rilegge il profilo senza toccare la sessione. Serve dopo eventi che il
  // client non osserva in tempo reale: redirect di ritorno da PayPal e
  // cancellazione subscription aggiornano il DB via webhook asincrono,
  // non via onAuthStateChange — nessun altro punto dello store lo saprebbe.
  refreshProfile: async () => {
    const user = get().user
    if (!user) return

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // Non sovrascrivere un profilo buono in cache con null per un
      // blip di rete transitorio.
      console.error('refreshProfile failed:', error)
      return
    }

    set({ profile })
  },
}))

export const selectIsPremium = (s: AuthStore) =>
  s.profile?.plan === 'premium' &&
  s.profile?.subscription_status === 'active'

export const selectIsAdmin = (s: AuthStore) =>
  s.user?.email === 'lucaiolienrico@gmail.com' &&
  s.profile?.is_admin === true
