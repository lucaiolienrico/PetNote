import { dueStatus, DUE_STYLES } from '@/lib/health'

export function ReminderBadge({ nextDueAt }: { nextDueAt: string | null }) {
  const status = dueStatus(nextDueAt)
  if (status === 'none') return null
  const { label, cls } = DUE_STYLES[status]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${cls}`}>
      {label}
    </span>
  )
}
