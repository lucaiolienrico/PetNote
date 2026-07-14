import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { OnboardingWelcome } from '@/components/shared/OnboardingWelcome'

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main content — padding bottom per BottomNav */}
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
      <OnboardingWelcome />
    </div>
  )
}
