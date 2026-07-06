import { NavLink } from 'react-router-dom'
import { Home, PawPrint, Settings } from 'lucide-react'

const links = [
  { to: '/app/dashboard', icon: Home,      label: 'Home' },
  { to: '/app/pets',      icon: PawPrint,  label: 'Animali' },
  { to: '/app/settings',  icon: Settings,  label: 'Impostazioni' },
] as const

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-3 px-5 text-xs font-medium transition-colors ${
                isActive ? 'text-brand-600' : 'text-gray-400'
              }`
            }
          >
            <Icon size={22} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
