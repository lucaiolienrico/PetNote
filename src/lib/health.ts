export type DueStatus = 'overdue' | 'soon' | 'ok' | 'none'

const SOON_DAYS = 30

// Calcola stato scadenza da una data ISO (YYYY-MM-DD). Confronto a livello di giorno,
// non timestamp, per evitare falsi "overdue" per differenze di fuso orario.
export function dueStatus(nextDueAt: string | null): DueStatus {
  if (!nextDueAt) return 'none'
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due   = new Date(nextDueAt); due.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  if (diffDays < 0) return 'overdue'
  if (diffDays <= SOON_DAYS) return 'soon'
  return 'ok'
}

export const DUE_STYLES: Record<DueStatus, { label: string; cls: string }> = {
  overdue: { label: 'Scaduto',     cls: 'bg-red-50 text-red-600' },
  soon:    { label: 'In scadenza', cls: 'bg-amber-50 text-amber-600' },
  ok:      { label: 'In regola',   cls: 'bg-brand-50 text-brand-700' },
  none:    { label: '',            cls: '' },
}

export function formatIt(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
}
