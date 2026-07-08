import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { AppShell }    from '@/components/layout/AppShell'
import { AuthLayout }  from '@/components/layout/AuthLayout'
import { RequireAuth }  from '@/components/shared/RequireAuth'
import { RequireGuest } from '@/components/shared/RequireGuest'

// Lazy pages — ogni route = chunk separato
const LoginPage      = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage   = lazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })))
const DashboardPage  = lazy(() => import('@/pages/app/DashboardPage').then(m => ({ default: m.DashboardPage })))
const PetsPage       = lazy(() => import('@/pages/app/PetsPage').then(m => ({ default: m.PetsPage })))
const PetDetailPage      = lazy(() => import('@/pages/app/PetDetailPage').then(m => ({ default: m.PetDetailPage })))
const PetFormPage        = lazy(() => import('@/pages/app/PetFormPage').then(m => ({ default: m.PetFormPage })))
const VaccinationsPage   = lazy(() => import('@/pages/app/VaccinationsPage').then(m => ({ default: m.VaccinationsPage })))
const AntiparasiticsPage = lazy(() => import('@/pages/app/AntiparasiticsPage').then(m => ({ default: m.AntiparasiticsPage })))
const SettingsPage   = lazy(() => import('@/pages/app/SettingsPage').then(m => ({ default: m.SettingsPage })))
const AdminPage      = lazy(() => import('@/pages/admin/AdminPage').then(m => ({ default: m.AdminPage })))

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const initialize = useAuthStore(s => s.initialize)
  const loading    = useAuthStore(s => s.loading)

  useEffect(() => { initialize() }, [initialize])

  if (loading) return <Spinner />

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

        <Route element={<RequireGuest />}>
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/app/dashboard" element={<DashboardPage />} />
            <Route path="/app/pets"          element={<PetsPage />} />
            <Route path="/app/pets/new"      element={<PetFormPage />} />
            <Route path="/app/pets/:id"      element={<PetDetailPage />} />
            <Route path="/app/pets/:id/edit" element={<PetFormPage />} />
            <Route path="/app/pets/:id/vaccinations"   element={<VaccinationsPage />} />
            <Route path="/app/pets/:id/antiparasitics" element={<AntiparasiticsPage />} />
            <Route path="/app/settings"  element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="/sys-admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
