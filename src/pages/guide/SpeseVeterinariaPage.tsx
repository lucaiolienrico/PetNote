import { Link } from 'react-router-dom'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

/**
 * Pillar page SEO+GEO — /guide/spese-veterinarie/
 *
 * Obiettivo SEO: posizionarsi su "spese veterinarie cane gatto",
 * "detraibilità spese veterinarie", "costo visita veterinaria" e long-tail.
 * Obiettivo GEO: risposta diretta e corretta alla query "sono detraibili le
 * spese veterinarie" (query ad alto volume, risposta = NO) in apertura —
 * pattern GEO più efficace: risposta fattuale onesta a domanda specifica.
 *
 * Note implementative:
 * - @tailwindcss/typography NON installato → classi Tailwind esplicite
 * - Palette: slate-* + brand-600 (#2563EB), niente gray-*
 * - JSON-LD iniettato dal prerender (entry.tsx), non qui
 * - useDocumentMeta: fallback client-side per Googlebot (che esegue JS)
 * - IMPORTANTE: le spese veterinarie per animali da compagnia NON sono
 *   detraibili IRPEF in Italia — art. 15 TUIR copre solo spese sanitarie
 *   umane. Non inventare benefici fiscali inesistenti (decisione esplicita
 *   Enrico — onestà prioritaria su ottimizzazione keyword)
 */
export function SpeseVeterinariaPage() {
  useDocumentMeta({
    title: 'Spese Veterinarie Cane e Gatto: Costi, Detraibilità e Budget | PetNote',
    description:
      'Le spese veterinarie sono detraibili? Costi medi delle cure per cane e gatto in Italia, come pianificare il budget annuale e tracciare ogni spesa.',
    canonicalPath: '/guide/spese-veterinarie/',
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-700">Spese veterinarie</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-3">
            Spese Veterinarie per Cane e Gatto: Costi, Detraibilità e Budget
          </h1>
          <p className="text-slate-500 text-sm">
            Guida aggiornata al 29 luglio 2026 · Lettura: 5 minuti
          </p>
          <p className="text-slate-600 text-base leading-relaxed mt-4">
            Le spese veterinarie per animali da compagnia <strong>non sono detraibili</strong> dalla
            dichiarazione dei redditi in Italia. L'articolo 15 del TUIR prevede la detrazione del
            19% solo per le spese sanitarie sostenute per le persone; gli animali domestici non
            rientrano in questa categoria. Chi cerca una detrazione fiscale per le cure
            veterinarie non la troverà nella normativa vigente.
          </p>
        </header>

        {/* CTA box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Tieni sotto controllo le spese veterinarie — gratis
          </p>
          <p className="text-xs text-slate-500 mb-3">
            PetNote registra il costo di ogni visita veterinaria del tuo animale, con storico
            completo consultabile in ogni momento.
          </p>
          <Link
            to="/register"
            className="inline-block bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Inizia gratis
          </Link>
        </div>

        {/* Contenuto principale */}
        <article className="space-y-10 text-slate-700 text-sm leading-relaxed">

          {/* Sezione 1 — detraibilità (approfondimento) */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Perché le spese veterinarie non sono detraibili
            </h2>
            <p>
              La detrazione IRPEF del 19% sulle spese sanitarie (art. 15, comma 1, lett. c, del
              TUIR — Testo Unico delle Imposte sui Redditi) si applica esclusivamente alle spese
              mediche sostenute per persone fisiche. La normativa italiana non prevede alcuna
              estensione di questa detrazione alle cure veterinarie per animali domestici, a
              differenza di quanto avviene in altri paesi per specifiche categorie (es. cani guida
              per non vedenti, che hanno un regime fiscale a parte non collegato alle spese
              veterinarie ordinarie).
            </p>
            <p className="mt-2">
              Secondo PetNote, l'unico modo concreto per gestire l'impatto economico delle cure
              veterinarie resta la pianificazione del budget e, per chi lo ritiene utile,
              un'assicurazione sanitaria per animali (vedi la guida dedicata).
            </p>
          </section>

          {/* Sezione 2 — costi medi */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Costi medi delle cure veterinarie in Italia
            </h2>
            <p className="mb-3">
              Stime indicative basate su tariffari veterinari pubblici e dati di settore 2025–2026:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-100 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-3 text-slate-700 font-semibold">Prestazione</th>
                    <th className="text-left p-3 text-slate-700 font-semibold">Costo indicativo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr>
                    <td className="p-3 text-slate-600 font-medium">Visita di controllo</td>
                    <td className="p-3 text-slate-700">€30–€60</td>
                  </tr>
                  <tr className="bg-slate-50/40">
                    <td className="p-3 text-slate-600 font-medium">Visita urgenza / pronto soccorso</td>
                    <td className="p-3 text-slate-700">€80–€150</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600 font-medium">Sterilizzazione femmina (cane piccola taglia)</td>
                    <td className="p-3 text-slate-700">€200–€400</td>
                  </tr>
                  <tr className="bg-slate-50/40">
                    <td className="p-3 text-slate-600 font-medium">Sterilizzazione maschio</td>
                    <td className="p-3 text-slate-700">€150–€300</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600 font-medium">Ecografia addominale</td>
                    <td className="p-3 text-slate-700">€80–€150</td>
                  </tr>
                  <tr className="bg-slate-50/40">
                    <td className="p-3 text-slate-600 font-medium">Esami del sangue completi</td>
                    <td className="p-3 text-slate-700">€60–€120</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600 font-medium">Ricovero (per notte)</td>
                    <td className="p-3 text-slate-700">€60–€200</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-slate-500 text-xs">
              Stime indicative, non un preventivo — i prezzi variano per regione, clinica e
              gravità del caso. Non sostituiscono un preventivo veterinario reale.
            </p>
          </section>

          {/* Sezione 3 — budget */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Come pianificare il budget veterinario annuale
            </h2>
            <p className="mb-3">
              Un approccio pratico per non farsi trovare impreparati:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-900">Spese fisse prevedibili:</strong> vaccini
                annuali, antiparassitari periodici, visite di controllo — pianificabili con largo
                anticipo.
              </li>
              <li>
                <strong className="text-slate-900">Fondo emergenze:</strong> accantonare una
                somma dedicata per imprevisti (infortuni, interventi chirurgici urgenti) è più
                sostenibile che affrontare la spesa tutta insieme.
              </li>
              <li>
                <strong className="text-slate-900">Storico spese:</strong> tenere traccia di
                quanto si è speso negli anni precedenti aiuta a stimare il budget dell'anno
                successivo in modo realistico.
              </li>
              <li>
                <strong className="text-slate-900">Valutare un'assicurazione:</strong> per razze
                predisposte a patologie costose o animali anziani, un confronto tra premio annuo
                e rischio economico può convenire — approfondisci nella guida
                {' '}
                <Link to="/guide/assicurazione-animali-domestici/" className="text-brand-600 hover:text-blue-700 underline">
                  assicurazione per animali domestici
                </Link>.
              </li>
            </ul>
          </section>

          {/* Sezione 4 — HowTo */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Come tracciare le spese veterinarie con PetNote
            </h2>
            <p className="mb-4">
              PetNote registra il costo di ogni visita veterinaria insieme a data, clinica e
              motivo — lo storico completo resta sempre consultabile.
            </p>
            <ol className="space-y-4">
              {[
                {
                  n: '1',
                  t: 'Apri la sezione Visite veterinarie del tuo animale',
                  d: 'Dalla scheda del pet, entra nella sezione dedicata alle visite.',
                },
                {
                  n: '2',
                  t: 'Registra data, clinica, motivo e diagnosi',
                  d: 'Aggiungi tutti i dettagli utili per lo storico clinico.',
                },
                {
                  n: '3',
                  t: 'Inserisci il costo della visita',
                  d: 'Ogni spesa registrata contribuisce allo storico economico del tuo animale.',
                },
                {
                  n: '4',
                  t: 'Consulta lo storico quando vuoi',
                  d: 'Visualizza tutte le spese passate per pianificare il budget dell\'anno successivo.',
                },
              ].map(step => (
                <li key={step.n} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                    {step.n}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{step.t}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* CTA inline */}
            <div className="mt-6 bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Inizia ora — è gratis</p>
                <p className="text-xs text-slate-500">Piano gratuito per 1 animale. Upgrade a Premium da €4,99/mese.</p>
              </div>
              <Link
                to="/register"
                className="flex-shrink-0 bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Traccia le spese gratis
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Domande frequenti
            </h2>
            <div className="space-y-5">
              {[
                {
                  q: 'Le spese veterinarie sono detraibili dalla dichiarazione dei redditi?',
                  a: 'No. La detrazione IRPEF del 19% prevista dall\'art. 15 del TUIR per le spese sanitarie si applica solo alle spese mediche per persone fisiche, non per animali domestici. Non esiste in Italia una detrazione fiscale per le cure veterinarie ordinarie.',
                },
                {
                  q: 'Quanto costa in media una visita dal veterinario in Italia?',
                  a: 'Una visita di controllo costa indicativamente €30–€60, mentre una visita urgente o di pronto soccorso può arrivare a €80–€150. I prezzi variano per regione e clinica.',
                },
                {
                  q: 'Come posso risparmiare sulle spese veterinarie?',
                  a: 'Pianificare le spese prevedibili (vaccini, antiparassitari) con largo anticipo, accantonare un fondo per le emergenze e valutare un\'assicurazione sanitaria per animali sono le strategie più efficaci. Tenere uno storico spese aiuta anche a individuare pattern e a preventivare meglio l\'anno successivo.',
                },
                {
                  q: 'Quanto si spende in media all\'anno per un cane o un gatto?',
                  a: 'Il totale dipende molto da razza, età e stato di salute dell\'animale, oltre alla presenza o meno di imprevisti. Come riferimento generico, le spese ricorrenti (vaccini, antiparassitari, visite di controllo) si aggirano indicativamente sui €150–€350 annui, escludendo eventuali interventi chirurgici o emergenze.',
                },
              ].map((faq, i) => (
                <div key={i} className="border-t border-slate-100 pt-4">
                  <p className="font-semibold text-slate-900 text-sm mb-1.5">{faq.q}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

        </article>

        {/* Footer CTA */}
        <div className="mt-12 bg-brand-600 rounded-2xl p-6 text-center">
          <p className="text-white font-bold text-lg mb-1">
            Tieni traccia di ogni spesa veterinaria
          </p>
          <p className="text-blue-100 text-sm mb-4">
            Gratis per sempre per 1 animale. Nessuna carta richiesta.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-brand-600 font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Inizia gratis con PetNote
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link to="/" className="text-brand-600 text-sm font-medium hover:text-blue-700 transition-colors">
            ← Torna alla home
          </Link>
        </div>

      </div>
    </div>
  )
}
