// Union locali: nel DB species/sex sono TEXT + CHECK constraint (no enum PG)
export type Species = 'cane' | 'gatto' | 'coniglio' | 'uccello' | 'rettile' | 'altro'
export type Sex     = 'maschio' | 'femmina' | 'non_specificato'

export const SPECIES: Record<Species, { label: string; emoji: string }> = {
  cane:     { label: 'Cane',     emoji: '🐕' },
  gatto:    { label: 'Gatto',    emoji: '🐈' },
  coniglio: { label: 'Coniglio', emoji: '🐇' },
  uccello:  { label: 'Uccello',  emoji: '🐦' },
  rettile:  { label: 'Rettile',  emoji: '🦎' },
  altro:    { label: 'Altro',    emoji: '🐾' },
}

export const SPECIES_OPTIONS = Object.entries(SPECIES).map(
  ([value, { label, emoji }]) => ({ value: value as Species, label, emoji }),
)

export function petAge(birthDate: string | null): string | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const now   = new Date()
  let months  = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months--
  if (months < 0) return null
  if (months < 12) return `${months} ${months === 1 ? 'mese' : 'mesi'}`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'anno' : 'anni'}`
}
