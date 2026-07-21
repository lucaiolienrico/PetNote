import { useEffect } from 'react'

const SITE_URL = 'https://www.petnote.it'
const DEFAULT_TITLE = 'PetNote — Gestione salute animali domestici'
const DEFAULT_DESCRIPTION =
  "Tieni traccia di vaccinazioni, visite veterinarie, antiparassitari e peso del tuo animale, tutto in un'unica app."

interface DocumentMetaOptions {
  title: string
  description: string
  /** Path assoluto (es. '/privacy'). Se omesso usa window.location.pathname corrente. */
  canonicalPath?: string
  /** Pagine senza valore per l'indicizzazione (login/register/shared token) */
  noindex?: boolean
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function setRobotsMeta(noindex: boolean) {
  const el = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (noindex) {
    setMetaTag('name', 'robots', 'noindex, nofollow')
  } else if (el) {
    el.remove()
  }
}

/**
 * Aggiorna title, meta description, og:*, canonical e (opzionale) robots
 * al mount di ogni pagina pubblica. SPA client-render: risolve il problema
 * per crawler che eseguono JS (Google) — NON risolve la visibilità per bot
 * che leggono solo HTML statico (GPTBot/ClaudeBot/PerplexityBot), quel
 * problema richiede prerendering/SSR (vedi discussione architetturale
 * separata, fuori scope qui).
 *
 * Ripristina i default in cleanup: evita che una pagina smontata "lasci"
 * il proprio title su una transizione successiva più veloce del render.
 */
export function useDocumentMeta({ title, description, canonicalPath, noindex = false }: DocumentMetaOptions) {
  useEffect(() => {
    const url = `${SITE_URL}${canonicalPath ?? window.location.pathname}`

    document.title = title
    setMetaTag('name', 'description', description)
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:url', url)
    setCanonical(url)
    setRobotsMeta(noindex)

    return () => {
      document.title = DEFAULT_TITLE
      setMetaTag('name', 'description', DEFAULT_DESCRIPTION)
      setRobotsMeta(false)
    }
  }, [title, description, canonicalPath, noindex])
}
