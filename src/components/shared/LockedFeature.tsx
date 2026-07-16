import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { UpgradeModal } from '@/components/shared/UpgradeModal'

interface Props {
  title:       string
  icon:        LucideIcon
  backTo:      string
  description?: string
}

// Blocco a pagina intera per funzionalità 100% Pro. A differenza del cap
// (vet_visits/allergies, 1 gratis + upsell), qui il contenuto reale non
// viene mai montato per un utente Free: niente hook dati, niente fetch —
// enforcement anche a livello applicativo, non solo visivo.
export function LockedFeature({ title, icon: Icon, backTo, description }: Props) {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <Link to={backTo} className="p-1 text-slate-600"><ArrowLeft size={22} /></Link>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-brand-50 flex items-center justify-center relative">
          <Icon size={26} className="text-brand-600" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center">
            <Lock size={12} className="text-slate-600" />
          </span>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Funzione Premium</p>
          <p className="text-sm text-slate-600 mt-1">
            {description ?? `${title} è disponibile solo con il piano Premium.`}
          </p>
        </div>
        <button
          onClick={() => setShowUpgrade(true)}
          className="bg-brand-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          Sblocca con Premium
        </button>
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}
