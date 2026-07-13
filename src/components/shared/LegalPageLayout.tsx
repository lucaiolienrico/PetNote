import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Props = {
  title:       string
  lastUpdated: string
  children:    ReactNode
}

/**
 * Shell comune per Privacy Policy e Termini di Servizio.
 * Niente plugin "prose" (@tailwindcss/typography non è installato nel
 * progetto) — tipografia esplicita con i token del design system
 * "Bianco Ghiaccio" (slate-50/500/900 + brand-600), stessa scelta fatta
 * ovunque nell'app.
 */
export function LegalPageLayout({ title, lastUpdated, children }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/" className="text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors">
          ← Torna alla home
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-1">{title}</h1>
        <p className="text-slate-500 text-xs mb-8">Ultimo aggiornamento: {lastUpdated}</p>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  )
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-slate-900 mb-2">{heading}</h2>
      <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 leading-relaxed">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}
