import { X, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  open:    boolean
  onClose: () => void
}

const BENEFITS = [
  'Animali illimitati',
  'Documenti e cartelle cliniche',
  'Condivisione con il veterinario',
  'Reminder email automatici',
]

export function UpgradeModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Passa a Premium ⭐</h2>
            <p className="text-sm text-gray-500 mt-1">
              Il piano Free include 1 animale. Sblocca tutto con Premium.
            </p>
          </div>
          <button onClick={onClose} aria-label="Chiudi" className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <ul className="space-y-2.5">
          {BENEFITS.map(b => (
            <li key={b} className="flex items-center gap-2.5 text-sm text-gray-700">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                <Check size={12} className="text-brand-700" strokeWidth={3} />
              </span>
              {b}
            </li>
          ))}
        </ul>

        <div className="bg-brand-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">€4,99<span className="text-sm font-normal text-gray-500">/mese</span></p>
          <p className="text-xs text-gray-500 mt-0.5">oppure €34,99/anno (-42%)</p>
        </div>

        <Link
          to="/app/settings"
          onClick={onClose}
          className="block w-full bg-brand-600 text-white text-center rounded-xl py-3 text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          Scopri Premium
        </Link>
      </div>
    </div>
  )
}
