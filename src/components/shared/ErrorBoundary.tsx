import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  /** Titolo del fallback. Default generico — personalizzare per contesto (route vs app-level). */
  title?: string
  /** Sottotitolo/spiegazione del fallback. */
  description?: string
  /** Label del bottone secondario (default "Dashboard"). */
  actionLabel?: string
  /** Handler del bottone secondario — es. navigate('/app/dashboard') o window.location.reload(). */
  onAction?: () => void
}

interface State {
  hasError: boolean
  isChunkError: boolean
}

// Messaggi emessi da import() dinamico quando il chunk richiesto non esiste
// più sull'edge (Vite genera hash nuovi ad ogni deploy; un tab rimasto aperto
// o un Service Worker con precache stale punta ancora a un file rimosso).
// Non è un bug applicativo — è un client con bundle disallineato dal deploy
// corrente. In questo caso "Riprova" (solo reset dello state locale) non
// risolve MAI: lo stesso import() già fallito resta in memoria, quindi la
// pagina rompe di nuovo al prossimo render. Incidente reale osservato:
// browser con bundle vecchio in cache → app "non accessibile" finché non si
// è pulita manualmente la cache/Service Worker (vedi audit 2026-07-19).
const CHUNK_ERROR_PATTERN =
  /dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk \d+ failed/i

// Un solo reload automatico per sessione di navigazione (sessionStorage,
// non persistente oltre la tab): evita loop infiniti se il reload non basta
// a risolvere (es. deploy realmente rotto, non solo cache locale stale).
// Pulita in main.tsx appena l'entry chunk carica con successo, così un
// eventuale NUOVO chunk error più avanti nella stessa sessione (dopo un
// altro deploy) ottiene comunque il proprio tentativo di auto-reload.
const CHUNK_RELOAD_GUARD_KEY = 'petnote:chunk-reload-attempted'

/**
 * ErrorBoundary generico — cattura errori di rendering React che altrimenti
 * farebbero collassare l'intero albero dei componenti (schermo bianco).
 *
 * DEVE essere una class component: React non offre un equivalente hook per
 * gli error boundary (getDerivedStateFromError/componentDidCatch non hanno
 * corrispettivo in React 19 core).
 *
 * Pattern di reset: nessun meccanismo di auto-reset interno — il chiamante
 * passa `key={qualcosa}` (es. `location.pathname` in App.tsx). Cambiare la
 * key forza React a smontare e rimontare l'istanza, azzerando lo stato
 * d'errore automaticamente quando l'utente naviga via dalla pagina rotta.
 * Il bottone "Riprova" interno gestisce invece errori transitori sulla
 * STESSA pagina (es. race condition risolta al render successivo) senza
 * richiedere una navigazione — TRANNE nel caso chunk error, dove il bottone
 * forza un reload vero (unico fix possibile, vedi sopra).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, isChunkError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, isChunkError: CHUNK_ERROR_PATTERN.test(error.message ?? '') }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Nessun servizio di error tracking esterno nello stack oggi — la console
    // è l'unico canale. Se in futuro si aggiunge un tool di monitoring, questo
    // è l'unico punto da estendere (nessun altro componente deve cambiare).
    console.error('ErrorBoundary ha catturato un errore:', error, errorInfo)

    if (this.state.isChunkError && sessionStorage.getItem(CHUNK_RELOAD_GUARD_KEY) !== '1') {
      sessionStorage.setItem(CHUNK_RELOAD_GUARD_KEY, '1')
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      const isChunkError  = this.state.isChunkError
      const reloadAlreadyTried = isChunkError && sessionStorage.getItem(CHUNK_RELOAD_GUARD_KEY) === '1'

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 mb-1">
              {isChunkError ? 'Nuova versione disponibile' : (this.props.title ?? 'Qualcosa è andato storto')}
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              {isChunkError
                ? (reloadAlreadyTried
                    ? "L'aggiornamento automatico non è riuscito. Ricarica manualmente la pagina."
                    : 'Aggiornamento in corso, un attimo...')
                : (this.props.description ?? 'Si è verificato un errore imprevisto. Riprova o torna alla dashboard.')}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  if (isChunkError) {
                    window.location.reload()
                  } else {
                    this.setState({ hasError: false, isChunkError: false })
                  }
                }}
                className="flex items-center gap-1.5 bg-brand-600 text-white font-semibold rounded-xl px-4 py-2.5 text-sm hover:bg-brand-700 transition-colors"
              >
                <RotateCcw size={14} /> {isChunkError ? 'Ricarica' : 'Riprova'}
              </button>
              {!isChunkError && this.props.onAction && (
                <button
                  onClick={this.props.onAction}
                  className="bg-slate-100 text-slate-700 font-semibold rounded-xl px-4 py-2.5 text-sm hover:bg-slate-200 transition-colors"
                >
                  {this.props.actionLabel ?? 'Dashboard'}
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
