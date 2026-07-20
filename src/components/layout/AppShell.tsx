import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { OnboardingWelcome } from '@/components/shared/OnboardingWelcome'

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — solo desktop ≥1280px (xl), hidden di default: zero impatto
          su mobile/tablet, dove il flex row qui sotto ha un solo figlio
          visibile e si comporta esattamente come il vecchio flex-col. */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Main content — padding bottom per BottomNav (solo mobile/tablet);
            container più largo su desktop, dove la Sidebar sostituisce la
            bottom nav e c'è più spazio orizzontale da sfruttare. */}
        <main className="flex-1 pb-20 xl:pb-0 max-w-lg xl:max-w-5xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Bottom nav — solo mobile/tablet, sostituita dalla Sidebar a xl */}
        <div className="xl:hidden">
          <BottomNav />
        </div>
      </div>

      <OnboardingWelcome />
    </div>
  )
}
