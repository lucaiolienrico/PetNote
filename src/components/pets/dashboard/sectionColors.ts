export type SectionKey =
  | 'vaccinations'
  | 'vet-visits'
  | 'weight'
  | 'antiparasitics'
  | 'allergies'
  | 'insurance'
  | 'health-events'
  | 'medications'
  | 'documents'

export interface SectionColors {
  iconBg:   string
  iconText: string
  dotBg:    string
  sparkHex: string
}

// Static map — never use template literals for color classes (Tailwind JIT purge).
export const SECTION_COLORS: Record<SectionKey, SectionColors> = {
  vaccinations: {
    iconBg:   'bg-blue-100',
    iconText: 'text-blue-600',
    dotBg:    'bg-blue-500',
    sparkHex: '#2563eb',
  },
  'vet-visits': {
    iconBg:   'bg-green-100',
    iconText: 'text-green-600',
    dotBg:    'bg-green-500',
    sparkHex: '#16a34a',
  },
  weight: {
    iconBg:   'bg-violet-100',
    iconText: 'text-violet-600',
    dotBg:    'bg-violet-500',
    sparkHex: '#7c3aed',
  },
  antiparasitics: {
    iconBg:   'bg-amber-100',
    iconText: 'text-amber-600',
    dotBg:    'bg-amber-500',
    sparkHex: '#d97706',
  },
  allergies: {
    iconBg:   'bg-red-100',
    iconText: 'text-red-600',
    dotBg:    'bg-red-500',
    sparkHex: '#dc2626',
  },
  insurance: {
    iconBg:   'bg-teal-100',
    iconText: 'text-teal-600',
    dotBg:    'bg-teal-500',
    sparkHex: '#0d9488',
  },
  'health-events': {
    iconBg:   'bg-orange-100',
    iconText: 'text-orange-600',
    dotBg:    'bg-orange-500',
    sparkHex: '#ea580c',
  },
  medications: {
    iconBg:   'bg-indigo-100',
    iconText: 'text-indigo-600',
    dotBg:    'bg-indigo-500',
    sparkHex: '#4f46e5',
  },
  documents: {
    iconBg:   'bg-pink-100',
    iconText: 'text-pink-600',
    dotBg:    'bg-pink-500',
    sparkHex: '#db2777',
  },
}
