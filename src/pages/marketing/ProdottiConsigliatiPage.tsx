import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

/**
 * v0 statica: nessuna tabella DB, nessun filtro specie/età, nessun admin CRUD.
 * Pagina pubblica: linkata dalla landing, prerenderizzata e presente in sitemap.
 */

interface ProductCategory {
  emoji: string
  title: string
  description: string
  url: string
}

const CATEGORIES: ProductCategory[] = [
  {
    emoji: '🐾',
    title: 'Crocchette',
    description: 'Alimentazione quotidiana per cani e gatti.',
    url: 'https://www.amazon.it/s?k=crocchette+cane+gatto&tag=pernote-21',
  },
  {
    emoji: '🦟',
    title: 'Antiparassitari',
    description: 'Protezione da pulci, zecche e parassiti interni.',
    url: 'https://www.amazon.it/s?k=antiparassitario+cane+gatto&tag=pernote-21',
  },
  {
    emoji: '💊',
    title: 'Integratori',
    description: 'Supporto a articolazioni, pelo e difese immunitarie.',
    url: 'https://www.amazon.it/s?k=integratori+cane+gatto&tag=pernote-21',
  },
]

export function ProdottiConsigliatiPage() {
  useDocumentMeta({
    title: 'Prenditi cura del tuo pet, ogni giorno — PetNote',
    description:
      'Categorie di prodotti utili per la cura quotidiana di cani e gatti: crocchette, antiparassitari e integratori.',
    canonicalPath: '/prodotti-consigliati',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft size={15} /> Torna alla home
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-6">
          Prenditi cura del tuo pet, ogni giorno
        </h1>
        <p className="text-slate-600 mt-2">
          Una selezione di categorie utili alla cura quotidiana del tuo animale.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {CATEGORIES.map(({ emoji, title, description, url }) => (
            <a
              key={title}
              href={url}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col hover:border-brand-600 transition-colors"
            >
              <span className="text-2xl" aria-hidden>{emoji}</span>
              <p className="font-semibold text-slate-900 mt-3">{title}</p>
              <p className="text-sm text-slate-600 mt-1 flex-1">{description}</p>
              <span className="inline-flex items-center gap-1.5 text-sm text-brand-600 font-medium mt-4">
                Vedi su Amazon <ExternalLink size={14} />
              </span>
            </a>
          ))}
        </div>

        <p className="text-xs text-slate-500 mt-8">
          In qualità di Affiliato Amazon, PetNote riceve un guadagno dagli acquisti
          idonei. Contiene link di affiliazione: PetNote può ricevere una commissione
          senza costi aggiuntivi per te.
        </p>
      </div>
    </div>
  )
}
