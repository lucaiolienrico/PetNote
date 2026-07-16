import { useState, type MouseEvent } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Pet } from '@/lib/queries/pets'
import { fetchPetPdfData } from '@/lib/pdf/petPdfData'
import { generatePetPdf } from '@/lib/pdf/generatePetPdf'

type ExportPdfButtonProps = {
  pet: Pet
  /**
   * 'icon' (default) — pulsante icona compatto, usato in PetCard e nell'header
   * di PetDetailPage. Invariato per non alterare la dashboard.
   * 'cta' — pulsante testuale a piena larghezza (Report PDF in PetDetailPage).
   * Stessa logica di generazione, solo markup/stile diversi: nessuna duplicazione.
   */
  variant?: 'icon' | 'cta'
}

export function ExportPdfButton({ pet, variant = 'icon' }: ExportPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const onExport = async (e: MouseEvent<HTMLButtonElement>) => {
    // Impedisce che il tap sull'export navighi anche al dettaglio quando il
    // bottone è affiancato a un Link cliccabile (es. PetCard in dashboard).
    e.stopPropagation()
    e.preventDefault()
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

  if (variant === 'cta') {
    return (
      <button
        onClick={onExport}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition-colors active:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="Genera report PDF completo dell'animale"
      >
        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
        {isGenerating ? 'Generazione in corso…' : 'Genera Report PDF'}
      </button>
    )
  }

  return (
    <button
      onClick={onExport}
      disabled={isGenerating}
      className="p-2 text-slate-600 hover:text-brand-600 transition-colors disabled:opacity-50"
      aria-label="Esporta scheda in PDF"
    >
      {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
    </button>
  )
}
