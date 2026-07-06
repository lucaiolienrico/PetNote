import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function RequireAuth() {
  const user = useAuthStore(s => s.user)
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
