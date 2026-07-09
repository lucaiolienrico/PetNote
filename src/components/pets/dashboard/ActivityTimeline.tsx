import { ChevronRight } from 'lucide-react'
import { SECTION_COLORS } from './sectionColors'
import type { SectionKey } from './sectionColors'

export interface ActivityItem {
  key:      string
  section:  SectionKey
  title:    string
  subtitle: string
  date:     string
}

interface Props {
  items: ActivityItem[]
}

function fmtDate(dateStr: string): string {
  const parts = dateStr.split('-')
  const y = parseInt(parts[0] ?? '2000', 10)
  const m = parseInt(parts[1] ?? '1', 10)
  const d = parseInt(parts[2] ?? '1', 10)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Oggi'
  if (date.toDateString() === yesterday.toDateString()) return 'Ieri'
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}

export function ActivityTimeline({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4 text-center">Nessuna attività recente</p>
    )
  }

  return (
    <ul>
      {items.map((item, i) => {
        const colors = SECTION_COLORS[item.section]
        const isLast = i === items.length - 1

        return (
          <li key={item.key} className="flex gap-3">
            {/* dot + connector */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${colors.dotBg} mt-1.5 ring-2 ring-white`} />
              {!isLast && (
                <div className="w-px flex-1 border-l-2 border-dashed border-slate-100 mt-0.5 mb-0" />
              )}
            </div>

            {/* content */}
            <div className={`flex items-start justify-between w-full gap-2 min-w-0${isLast ? '' : ' pb-4'}`}>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{item.subtitle}</p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                <span className="text-xs text-slate-400 whitespace-nowrap">{fmtDate(item.date)}</span>
                <ChevronRight size={13} className="text-slate-300" />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
