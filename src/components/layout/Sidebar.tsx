import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, PawPrint, Settings, Crown } from 'lucide-react'
import { useAuthStore, selectHasFullAccess } from '@/stores/auth.store'
import { UpgradeModal } from '@/components/shared/UpgradeModal'

// Stessa struttura link di BottomNav.tsx (route, icone, label) — nav
// desktop e mobile devono restare in sync, ma sono componenti separati:
// BottomNav.tsx è nella lista "non-touch" del progetto, quindi la versione
// desktop vive qui invece di essere un'astrazione condivisa.
const links = [
  { to: '/app/dashboard', icon: Home,      label: 'Home' },
  { to: '/app/pets',      icon: PawPrint,  label: 'Animali' },
  { to: '/app/settings',  icon: Settings,  label: 'Impostazioni' },
] as const

export function Sidebar() {
  const hasFullAccess = useAuthStore(selectHasFullAccess)
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <aside className="hidden xl:flex flex-none w-64 flex-col border-r border-slate-100 bg-white sticky top-0 h-screen px-4 py-6">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-none">
          <PawPrint size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">PetNote</span>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Icon size={19} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        {hasFullAccess ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3">
            <p className="text-xs font-semibold text-slate-900">Premium attivo</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Pet illimitati e tutte le funzionalità sbloccate.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Crown size={19} strokeWidth={1.8} />
            Premium
          </button>
        )}
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </aside>
  )
}
