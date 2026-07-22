import { Link } from 'react-router-dom'
import { Bell, ChevronRight } from 'lucide-react'

interface Props {
  label:     string
  sublabel:  string
  daysUntil: number
  // Rotta della sezione proprietaria della scadenza (vaccinazione/antiparassitario/
  // promemoria custom). Prima assente: il banner era puro markup, "Vedi >" non navigava
  // da nessuna parte — fix bug CTA morta.
  to:        string
}

export function ReminderBanner({ label, sublabel, daysUntil, to }: Props) {
  const daysText =
    daysUntil === 0 ? 'Oggi'
    : daysUntil === 1 ? 'Domani'
    : `Tra ${daysUntil} giorni`

  return (
    <Link
      to={to}
      className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-2xl p-3.5 active:opacity-75 transition-opacity"
    >
      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
        <Bell size={18} className="text-violet-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 truncate">{sublabel}</p>
        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{label}</p>
        <p className="text-sm font-bold text-violet-600">{daysText}</p>
      </div>

      <div className="flex items-center gap-0.5 text-xs font-semibold text-violet-600 border border-violet-200 rounded-full px-3 py-1.5 bg-white flex-shrink-0 whitespace-nowrap">
        Vedi
        <ChevronRight size={12} />
      </div>
    </Link>
  )
}
