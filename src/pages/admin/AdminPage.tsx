import { Navigate } from 'react-router-dom'
import { useAuthStore, selectIsAdmin } from '@/stores/auth.store'

export function AdminPage() {
  const isAdmin = useAuthStore(selectIsAdmin)

  // Gate doppio: email + is_admin dal DB
  if (!isAdmin) return <Navigate to="/app/dashboard" replace />

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">🔧 Admin Panel</h1>
      {/* Metriche via Edge Function admin-metrics (passaggio 16) */}
      <p className="text-gray-400 text-sm">Dashboard metriche — passaggio 16</p>
    </div>
  )
}
