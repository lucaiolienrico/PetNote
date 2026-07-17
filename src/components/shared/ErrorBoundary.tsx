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
}

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
 * richiedere una navigazione.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Nessun servizio di error tracking esterno nello stack oggi — la console
    // è l'unico canale. Se in futuro si aggiunge un tool di monitoring, questo
    // è l'unico punto da estendere (nessun altro componente deve cambiare).
    console.error('ErrorBoundary ha catturato un errore:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 mb-1">
              {this.props.title ?? 'Qualcosa è andato storto'}
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              {this.props.description ?? 'Si è verificato un errore imprevisto. Riprova o torna alla dashboard.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center gap-1.5 bg-brand-600 text-white font-semibold rounded-xl px-4 py-2.5 text-sm hover:bg-brand-700 transition-colors"
              >
                <RotateCcw size={14} /> Riprova
              </button>
              {this.props.onAction && (
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
