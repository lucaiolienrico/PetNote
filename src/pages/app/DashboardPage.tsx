import { useAuthStore } from '@/stores/auth.store'

export function DashboardPage() {
  const profile = useAuthStore(s => s.profile)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Ciao{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-sm text-gray-500">Come stanno i tuoi animali?</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          profile?.plan === 'premium'
            ? 'bg-brand-100 text-brand-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {profile?.plan === 'premium' ? '⭐ Premium' : 'Free'}
        </span>
      </div>

      {/* Placeholder — verrà popolato al passaggio 5-6 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
        Aggiungi il tuo primo animale →
      </div>
    </div>
  )
}
