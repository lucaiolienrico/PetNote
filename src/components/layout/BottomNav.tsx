import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, PawPrint, Settings, Crown } from 'lucide-react'
import { useAuthStore, selectHasFullAccess } from '@/stores/auth.store'
import { UpgradeModal } from '@/components/shared/UpgradeModal'

const links = [
  { to: '/app/dashboard', icon: Home,      label: 'Home' },
  { to: '/app/pets',      icon: PawPrint,  label: 'Animali' },
  { to: '/app/settings',  icon: Settings,  label: 'Impostazioni' },
] as const

// Classi condivise dalla CTA Premium con le NavLink — stessa gabbia visiva,
// stesso padding/gap/dimensione icona, colore di riposo identico (text-slate-500).
const itemClasses = 'flex flex-col items-center gap-0.5 py-3 px-5 text-xs font-medium transition-colors'

export function BottomNav() {
  const hasFullAccess = useAuthStore(selectHasFullAccess)
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${itemClasses} ${
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

        {/* CTA upgrade — non è una route (nessun NavLink/isActive), stessa
            gabbia visiva delle altre voci. Nascosta per chi ha già accesso
            pieno (premium attivo o admin bypass): non ha senso mostrare un
            invito a pagare a chi ha già pagato o è admin. Riusa UpgradeModal
            + useCreateSubscription già esistenti — stesso flusso PayPal
            (create-paypal-subscription → redirect approvalUrl) usato da
            LockedFeature e dalle pagine con cap Free, nessuna nuova
            dipendenza introdotta. */}
        {!hasFullAccess && (
          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            className={`${itemClasses} text-slate-500`}
          >
            <span className="flex items-center justify-center rounded-full p-1 transition-colors">
              <Crown size={22} strokeWidth={1.8} />
            </span>
            Premium
          </button>
        )}
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </nav>
  )
}
