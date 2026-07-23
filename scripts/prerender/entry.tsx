import fs from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import type { ComponentType } from 'react'

import { LandingPage } from '@/pages/marketing/LandingPage'
import { PrivacyPolicyPage } from '@/pages/public/PrivacyPolicyPage'
import { TermsOfServicePage } from '@/pages/public/TermsOfServicePage'
import { LibrettoSanitarioPage } from '@/pages/guide/LibrettoSanitarioPage'

/**
 * Perché questo script esiste:
 * PetNote è una SPA client-rendered (vedi commento in useDocumentMeta.ts).
 * Googlebot esegue JS e legge i meta tag iniettati a runtime — GPTBot,
 * ClaudeBot, PerplexityBot NON eseguono JS: senza questo step vedono solo
 * <div id="root"></div> vuoto. Questo script genera HTML statico reale
 * per le pagine pubbliche indicizzabili, eseguito DOPO "vite build" via
 * un secondo build SSR (--ssr) dello stesso entry con Vite: niente
 * framework SSR aggiuntivo, niente dipendenze nuove.
 *
 * Import "@/pages/..." qui NON eseguono mai gli useEffect dei componenti
 * (renderToStaticMarkup non li invoca) — per questo title/description/
 * canonical/JSON-LD vengono iniettati manualmente sotto, non delegati a
 * useDocumentMeta (che resta comunque utile per il fallback client-side
 * quando React idrata sopra questo markup).
 */

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const SITE_URL = 'https://www.petnote.it'

const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PetNote',
  url: SITE_URL,
  logo: `${SITE_URL}/pwa-512x512.png`,
  description:
    "App italiana per la gestione della salute degli animali domestici: vaccinazioni, visite veterinarie, antiparassitari, peso e altro.",
}

const SOFTWARE_APPLICATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PetNote',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'EUR',
    },
    {
      '@type': 'Offer',
      name: 'Premium mensile',
      price: '4.99',
      priceCurrency: 'EUR',
    },
    {
      '@type': 'Offer',
      name: 'Premium annuale',
      price: '34.99',
      priceCurrency: 'EUR',
    },
  ],
  // Recensioni reali di utenti verificati (stessi dati di LandingPage.tsx
  // REVIEWS, forniti da Enrico — vedi sessione 2026-07-17). Media calcolata
  // da rating reali: (5+5+4.5+4)/4 = 4.625 -> 4.6.
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.6',
    reviewCount: '4',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Corrado' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody:
        'Prima impazzivo con le medicine del mio cane anziano e avevo il terrore di scordarmele. PetNote mi ha salvato la vita: ho tutti i promemoria sul telefono e non salto più una dose.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Gianni' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody:
        'Finalmente in casa non facciamo più confusione su chi ha già portato fuori il cane. Segniamo tutto sull\u2019app in un attimo e le notifiche sono super precise. Mai più senza.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Miki' },
      reviewRating: { '@type': 'Rating', ratingValue: '4.5', bestRating: '5' },
      reviewBody:
        'Dimenticavo regolarmente quando dare l\u2019antiparassitario o fare i richiami dei vaccini. Adesso l\u2019app mi manda l\u2019avviso al momento giusto e sto tranquilla. Ottima, anche se la schermata iniziale si potrebbe alleggerire un po\u2019.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Francesca' },
      reviewRating: { '@type': 'Rating', ratingValue: '4', bestRating: '5' },
      reviewBody:
        'Tenere traccia a mano di tutto quello che serve per la mia gatta era un incubo, finivo sempre per perdere i foglietti. L\u2019app è comodissima per segnare tutto al volo.',
    },
  ],
}

interface RouteDef {
  urlPath: string
  outFile: string
  Component: ComponentType
  title: string
  description: string
  jsonLd?: object[]
}

const LIBRETTO_BREADCRUMB_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Libretto Sanitario Digitale per Cane e Gatto',
      item: `${SITE_URL}/guide/libretto-sanitario-digitale-cane-gatto/`,
    },
  ],
}

const LIBRETTO_ARTICLE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Il Libretto Sanitario Digitale per Cane e Gatto — Guida Completa',
  description:
    'Scopri cos\'è il libretto sanitario digitale per cane e gatto, cosa deve contenere, i vantaggi rispetto a quello cartaceo e come gestirlo con PetNote.',
  url: `${SITE_URL}/guide/libretto-sanitario-digitale-cane-gatto/`,
  datePublished: '2026-07-21',
  dateModified: '2026-07-21',
  author: { '@type': 'Organization', name: 'PetNote', url: SITE_URL },
  publisher: {
    '@type': 'Organization',
    name: 'PetNote',
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/pwa-512x512.png` },
  },
  inLanguage: 'it-IT',
  about: { '@type': 'Thing', name: 'Libretto sanitario animali domestici' },
}

const LIBRETTO_FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Il libretto sanitario digitale ha valore legale?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Il libretto digitale ha lo stesso valore del cartaceo per l\'uso quotidiano (visite, informazioni al veterinario, promemoria). Per documenti con valore legale obbligatorio come il passaporto europeo per animali per i viaggi internazionali, il formato cartaceo ufficiale rimane necessario.',
      },
    },
    {
      '@type': 'Question',
      name: 'PetNote è gratuito?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sì. PetNote ha un piano gratuito permanente che permette di gestire 1 animale con tutte le funzioni base. Il piano Premium da €4,99/mese sblocca animali illimitati e funzioni avanzate.',
      },
    },
    {
      '@type': 'Question',
      name: 'Posso condividere il libretto sanitario con il mio veterinario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sì. Con la funzione Share Link di PetNote puoi generare un link temporaneo che il veterinario può aprire dal suo smartphone senza creare un account. Il link mostra vaccinazioni, visite, antiparassitari, peso, farmaci e diario sanitario.',
      },
    },
    {
      '@type': 'Question',
      name: 'Cosa succede se perdo il libretto cartaceo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con PetNote tutti i dati sono salvati in cloud. Anche se perdi o rompi il telefono, i dati rimangono accessibili da qualsiasi altro dispositivo.',
      },
    },
    {
      '@type': 'Question',
      name: 'PetNote funziona su iPhone e Android?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sì. PetNote è una PWA (Progressive Web App) che funziona nel browser di iPhone, Android, Mac e PC senza dover installare nulla dallo store. Puoi aggiungerla alla schermata home per usarla come una vera app.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quanti animali posso gestire con PetNote?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con il piano gratuito puoi gestire 1 animale. Con il piano Premium (€4,99/mese o €34,99/anno) puoi gestire animali illimitati.',
      },
    },
  ],
}

const LIBRETTO_HOWTO_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Come creare il libretto sanitario digitale con PetNote',
  description: 'Guida passo passo per creare il libretto digitale del tuo cane o gatto con PetNote in meno di 5 minuti.',
  totalTime: 'PT5M',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Crea un account gratuito', text: 'Vai su www.petnote.it e registrati con email e password oppure con Google. Il piano gratuito non richiede carta di credito.' },
    { '@type': 'HowToStep', position: 2, name: 'Aggiungi il tuo animale', text: 'Inserisci nome, specie, razza, data di nascita e microchip. Puoi aggiungere una foto profilo.' },
    { '@type': 'HowToStep', position: 3, name: 'Inserisci i dati dal vecchio libretto cartaceo', text: 'Registra le vaccinazioni passate con data e veterinario. PetNote calcolerà automaticamente le prossime scadenze.' },
    { '@type': 'HowToStep', position: 4, name: 'Attiva i promemoria push', text: 'Dalle impostazioni, abilita le notifiche push. Riceverai un avviso 7 giorni prima di ogni scadenza.' },
    { '@type': 'HowToStep', position: 5, name: 'Condividi con il veterinario', text: 'Con la funzione Share Link, il tuo vet può consultare la scheda sanitaria completa dal suo smartphone, senza bisogno di un account PetNote.' },
  ],
}

const ROUTES: RouteDef[] = [
  {
    urlPath: '/',
    outFile: 'index.html',
    Component: LandingPage,
    title: 'PetNote — Gestione salute animali domestici',
    description:
      "Tieni traccia di vaccinazioni, visite veterinarie, antiparassitari e peso del tuo animale, tutto in un'unica app. Gratis per un animale.",
    jsonLd: [ORGANIZATION_JSON_LD, SOFTWARE_APPLICATION_JSON_LD],
  },
  {
    urlPath: '/privacy',
    outFile: 'privacy/index.html',
    Component: PrivacyPolicyPage,
    title: 'Privacy Policy — PetNote',
    description:
      'Informativa sulla privacy di PetNote: quali dati raccogliamo su di te e sul tuo animale, come li usiamo e come li proteggiamo.',
  },
  {
    urlPath: '/termini',
    outFile: 'termini/index.html',
    Component: TermsOfServicePage,
    title: 'Termini di Servizio — PetNote',
    description:
      "Termini e condizioni d'uso di PetNote: piani, abbonamento, recesso e responsabilità del servizio.",
  },
  {
    urlPath: '/guide/libretto-sanitario-digitale-cane-gatto/',
    outFile: 'guide/libretto-sanitario-digitale-cane-gatto/index.html',
    Component: LibrettoSanitarioPage,
    title: 'Libretto Sanitario Digitale per Cane e Gatto — Guida Completa | PetNote',
    description:
      "Scopri cos'è il libretto sanitario digitale per cane e gatto, cosa deve contenere, i vantaggi rispetto a quello cartaceo e come gestirlo con PetNote. Guida 2026.",
    jsonLd: [
      LIBRETTO_BREADCRUMB_JSON_LD,
      LIBRETTO_ARTICLE_JSON_LD,
      LIBRETTO_FAQ_JSON_LD,
      LIBRETTO_HOWTO_JSON_LD,
    ],
  },
]

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function injectIntoTemplate(template: string, route: RouteDef, markup: string): string {
  const canonical = `${SITE_URL}${route.urlPath}`
  let html = template

  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(route.title)}</title>`)

  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${escapeHtml(route.description)}" />`,
  )

  html = html.replace(
    /<meta property="og:title"\s+content=".*?" \/>/,
    `<meta property="og:title"       content="${escapeHtml(route.title)}" />`,
  )
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
  )
  html = html.replace(
    /<meta property="og:url"\s+content=".*?" \/>/,
    `<meta property="og:url"         content="${canonical}" />`,
  )

  const canonicalTag = `<link rel="canonical" href="${canonical}" />`
  html = html.includes('rel="canonical"')
    ? html.replace(/<link rel="canonical" href=".*?" \/>/, canonicalTag)
    : html.replace('</head>', `    ${canonicalTag}\n  </head>`)

  if (route.jsonLd?.length) {
    const scripts = route.jsonLd
      .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
      .join('\n    ')
    html = html.replace('</head>', `    ${scripts}\n  </head>`)
  }

  html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`)

  return html
}

function run(): void {
  const templatePath = path.join(DIST_DIR, 'index.html')
  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Template non trovato: ${templatePath}. Esegui "vite build" (client) prima di questo script.`,
    )
  }
  const template = fs.readFileSync(templatePath, 'utf-8')

  for (const route of ROUTES) {
    const markup = renderToStaticMarkup(
      <StaticRouter location={route.urlPath}>
        <route.Component />
      </StaticRouter>,
    )
    const html = injectIntoTemplate(template, route, markup)
    const outPath = path.join(DIST_DIR, route.outFile)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, html, 'utf-8')
    console.log(`[prerender] ${route.outFile} — ${(html.length / 1024).toFixed(1)} KB`)
  }
}

run()
