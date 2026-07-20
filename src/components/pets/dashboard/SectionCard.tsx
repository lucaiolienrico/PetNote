import { Link } from 'react-router-dom'
import { ChevronRight, Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  petId:       string
  path:        string
  label:       string
  icon:        LucideIcon
  iconBg:      string
  iconText:    string
  count?:      string
  lastLabel?:  string
  locked:      boolean
  onLockClick: () => void
}

export function SectionCard({
  petId, path, label, icon: Icon,
  iconBg, iconText, count, lastLabel, locked, onLockClick,
}: Props) {
  const body = (
    <div className="relative bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 p-4 xl:p-5 flex flex-col gap-2 h-full">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon size={18} className={iconText} />
        </div>
        {locked ? (
          <span className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Lock size={10} className="text-slate-400" />
          </span>
        ) : (
          <ChevronRight size={16} className="text-slate-400 mt-0.5" />
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900 leading-tight">{label}</p>
        {count && <p className="text-xs text-slate-500 mt-0.5">{count}</p>}
      </div>

      {lastLabel && (
        <p className="text-xs text-slate-400 border-t border-slate-50 pt-2 mt-auto">{lastLabel}</p>
      )}
    </div>
  )

  if (locked) {
    return (
      <button
        type="button"
        onClick={onLockClick}
        className="block w-full h-full text-left"
        aria-label={`${label} — richiede Premium`}
      >
        {body}
      </button>
    )
  }

  return (
    <Link
      to={`/app/pets/${petId}/${path}`}
      className="block h-full active:opacity-75 transition-opacity"
    >
      {body}
    </Link>
  )
}
