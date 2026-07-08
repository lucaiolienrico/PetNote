import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Pet } from '@/lib/queries/pets'
import { fetchPetPdfData } from '@/lib/pdf/petPdfData'
import { generatePetPdf } from '@/lib/pdf/generatePetPdf'

export function ExportPdfButton({ pet }: { pet: Pet }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const onExport = async () => {
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
      onClick={onExport}
      disabled={isGenerating}
      className="p-2 text-gray-500 hover:text-brand-600 transition-colors disabled:opacity-50"
      aria-label="Esporta scheda in PDF"
    >
      {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
    </button>
  )
}
