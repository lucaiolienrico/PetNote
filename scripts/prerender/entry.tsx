import fs from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import type { ComponentType } from 'react'

import { LandingPage } from '@/pages/marketing/LandingPage'
import { PrivacyPolicyPage } from '@/pages/public/PrivacyPolicyPage'
import { TermsOfServicePage } from '@/pages/public/TermsOfServicePage'

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
const SITE_URL = 'https://pet-note.vercel.app'

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
}

interface RouteDef {
  urlPath: string
  outFile: string
  Component: ComponentType
  title: string
  description: string
  jsonLd?: object[]
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
