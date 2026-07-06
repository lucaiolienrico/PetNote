import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function RequireGuest() {
  const user = useAuthStore(s => s.user)
  return user ? <Navigate to="/app/dashboard" replace /> : <Outlet />
}
