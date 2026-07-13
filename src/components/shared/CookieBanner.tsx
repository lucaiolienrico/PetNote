import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'petnote_cookie_notice_dismissed'

/**
 * Banner informativo cookie — NON un consent manager con opt-in/categorie.
 *
 * Perché: PetNote usa solo cookie/storage tecnici necessari al funzionamento
 * (sessione Supabase Auth, redirect PayPal in fase di checkout). Nessun
 * analytics, pixel o script di terze parti è presente in index.html/main.tsx
 * al momento della scrittura. Per il solo trattamento tecnico, il Garante
 * Privacy italiano e l'ePrivacy Directive non richiedono consenso opt-in
 * preventivo — è sufficiente un'informativa. Se in futuro viene aggiunto
 * un qualsiasi tracker non tecnico (analytics, ads, heatmap), questo
 * componente VA sostituito con un vero consent manager a categorie
 * (necessari/statistici/marketing) con default OFF sui non necessari,
 * altrimenti si viola l'art. 122 Codice Privacy.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Lettura solo al mount, mai in render, per evitare flash del banner
    // su utenti che l'hanno già chiuso in una sessione precedente.
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // localStorage non disponibile (Safari private mode / storage pieno):
      // il banner ricomparirà al prossimo giro, non è un errore bloccante.
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Informativa cookie"
      className="fixed bottom-0 inset-x-0 z-50 bg-slate-900 text-slate-50 px-4 py-3.5 shadow-lg"
    >
      <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center gap-3">
        <p className="text-xs leading-relaxed text-slate-200 flex-1">
          Usiamo solo cookie tecnici necessari al funzionamento di PetNote (login, sessione).
          Nessun cookie di profilazione o di terze parti.{' '}
          <Link to="/privacy" className="underline text-white font-medium">
            Scopri di più
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg px-4 py-2 transition-colors"
        >
          Ho capito
        </button>
      </div>
    </div>
  )
}
