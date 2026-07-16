import { useState, type MouseEvent } from 'react'
import { FileDown, Loader2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Pet } from '@/lib/queries/pets'
import { fetchPetPdfData } from '@/lib/pdf/petPdfData'
import { generatePetPdf } from '@/lib/pdf/generatePetPdf'

interface Props {
  pet: Pet
}

// Tile azione nella griglia SectionCard — stesso markup/stile (dimensioni, bordi,
// ombre, tipografia) delle altre card, ma è un <button> che triggera la stessa
// generazione PDF già usata da ExportPdfButton (variant="cta"), non un Link di
// navigazione. Nessuna duplicazione: riusa fetchPetPdfData/generatePetPdf as-is.
// ExportPdfButton.tsx NON viene toccato — resta l'unico "owner" della logica PDF.
export function ReportPdfCard({ pet }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)

  const onExport = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    if (isGenerating) return
    setIsGenerating(true)
    try {
      const data = await fetchPetPdfData(pet.id)
      generatePetPdf(pet, data)
    } catch {
      toast.error('Generazione PDF non riuscita')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onExport}
      disabled={isGenerating}
      className="block w-full text-left active:opacity-75 transition-opacity disabled:cursor-not-allowed disabled:opacity-75"
      aria-label="Genera report PDF completo dell'animale"
    >
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 p-4 flex flex-col gap-2 h-full">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <FileDown size={18} className="text-purple-600" />
          </div>
          {isGenerating ? (
            <Loader2 size={16} className="text-slate-400 mt-0.5 animate-spin" />
          ) : (
            <ChevronRight size={16} className="text-slate-400 mt-0.5" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900 leading-tight">Genera Report PDF</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGenerating ? 'Generazione in corso…' : 'Scheda completa in PDF'}
          </p>
        </div>
      </div>
    </button>
  )
}
