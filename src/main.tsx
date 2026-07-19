import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App'
import { CookieBanner } from './components/shared/CookieBanner'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import './styles/index.css'

// Se siamo arrivati fin qui, l'entry chunk corrente ha caricato con successo:
// eventuali ChunkLoadError catturati da un deploy PRECEDENTE in questa stessa
// sessione non sono più rilevanti. Pulire la guardia permette a ErrorBoundary
// di tentare un nuovo auto-reload se in futuro (stessa tab, nuovo deploy)
// si ripresenta un chunk error, invece di restare bloccata al primo tentativo.
sessionStorage.removeItem('petnote:chunk-reload-attempted')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            1000 * 60 * 5,
      retry:                1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Boundary catastrofico — ultima rete di sicurezza per errori fuori dal
        routing (es. QueryClientProvider/BrowserRouter stessi). Nessun reset
        automatico qui (niente location da usare come key a questo livello):
        l'unica azione sensata è un reload completo. Il boundary route-level
        dentro App.tsx gestisce invece i crash di singole pagine, con reset
        automatico alla navigazione — quello copre la stragrande maggioranza
        dei casi reali. */}
    <ErrorBoundary
      title="PetNote ha riscontrato un problema"
      description="Prova a ricaricare la pagina. Se il problema persiste, contatta il supporto."
      actionLabel="Ricarica pagina"
      onAction={() => window.location.reload()}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster position="top-center" richColors />
          <CookieBanner />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
