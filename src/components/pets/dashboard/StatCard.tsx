import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface Props {
  label:     string
  value:     string | number
  sublabel?: string
  icon:      LucideIcon
  iconBg:    string
  iconText:  string
  sparkData: number[]
  sparkHex:  string
  locked?:   boolean
  to?:          string      // se presente, la card diventa cliccabile
  onLockClick?: () => void  // chiamato al tap quando locked (mostra upgrade invece di navigare)
}

export function StatCard({
  label, value, sublabel, icon: Icon,
  iconBg, iconText, sparkData, sparkHex, locked, to, onLockClick,
}: Props) {
  const hasSparkline = !locked && sparkData.length > 1
  const points = sparkData.map((v, i) => ({ i, v }))

  const body = (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 p-4 flex flex-col gap-1.5 h-full">
      <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center`}>
        <Icon size={17} className={iconText} />
      </div>

      <p className="text-xs text-slate-500">{label}</p>

      {locked ? (
        <div className="flex items-center gap-1.5 py-0.5">
          <Lock size={13} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-400">Premium</span>
        </div>
      ) : (
        <p className="text-2xl font-bold text-slate-900 leading-none tabular-nums">{value}</p>
      )}

      {!locked && sublabel && (
        <p className="text-xs text-slate-400">{sublabel}</p>
      )}

      {hasSparkline && (
        <div className="h-10 -mx-1 -mb-1 mt-0.5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={sparkHex}
                dot={false}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )

  if (!to) return body

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
    <Link to={to} className="block h-full active:opacity-75 transition-opacity">
      {body}
    </Link>
  )
}
