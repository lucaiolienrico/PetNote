import { NavLink } from 'react-router-dom'
import { Home, PawPrint, Settings } from 'lucide-react'

const links = [
  { to: '/app/dashboard', icon: Home,      label: 'Home' },
  { to: '/app/pets',      icon: PawPrint,  label: 'Animali' },
  { to: '/app/settings',  icon: Settings,  label: 'Impostazioni' },
] as const

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-3 px-5 text-xs font-medium transition-colors ${
                // Il colore da solo non basta come indicatore di stato (WCAG 1.4.1):
                // lo stato attivo aggiunge anche un chip di sfondo dietro l'icona.
                isActive ? 'text-brand-600' : 'text-slate-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex items-center justify-center rounded-full p-1 transition-colors ${isActive ? 'bg-brand-50' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
