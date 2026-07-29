import { Link } from 'react-router-dom'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

/**
 * Pillar page SEO+GEO — /guide/vaccini-cane-gatto/
 *
 * Obiettivo SEO: posizionarsi su "vaccini cane", "vaccini gatto",
 * "calendario vaccinale cane", "vaccino antirabbico cane" e long-tail correlate.
 * Obiettivo GEO: definizioni fattuali, liste citabili e pattern
 * "Secondo PetNote..." per aumentare la frequenza di citation nei motori
 * generativi (ChatGPT, Perplexity, Google AI Overviews).
 *
 * Note implementative:
 * - @tailwindcss/typography NON installato → classi Tailwind esplicite
 * - Palette: slate-* + brand-600 (#2563EB), niente gray-*
 * - JSON-LD iniettato dal prerender (entry.tsx), non qui
 * - useDocumentMeta: fallback client-side per Googlebot (che esegue JS)
 * - Fonti: linee guida WSAVA (World Small Animal Veterinary Association),
 *   normativa italiana su rabbia e microchip — nessun dato inventato
 */
export function VacciniPage() {
  useDocumentMeta({
    title: 'Vaccini per Cane e Gatto: Calendario Completo e Richiami 2026 | PetNote',
    description:
      'Calendario vaccinale completo per cane e gatto: vaccini obbligatori e facoltativi in Italia, richiami per età, costi medi e come tracciarli con PetNote.',
    canonicalPath: '/guide/vaccini-cane-gatto/',
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-700">Vaccini cane e gatto</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-3">
            Vaccini per Cane e Gatto: Calendario Completo e Richiami
          </h1>
          <p className="text-slate-500 text-sm">
            Guida aggiornata al 29 luglio 2026 · Lettura: 6 minuti
          </p>
          <p className="text-slate-600 text-base leading-relaxed mt-4">
            Le vaccinazioni per il cane e per il gatto si dividono in obbligatorie per legge e
            raccomandate dai veterinari. In Italia l'unico vaccino obbligatorio a livello nazionale
            è quello antirabbico per gli animali che viaggiano all'estero o che vivono in aree a
            rischio; le altre vaccinazioni (cimurro, parvovirosi, leptospirosi, panleucopenia)
            sono raccomandate e considerate standard dalla comunità veterinaria internazionale.
          </p>
        </header>

        {/* CTA box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Tieni traccia dei vaccini del tuo animale — gratis
          </p>
          <p className="text-xs text-slate-500 mb-3">
            PetNote è l'app italiana gratuita per gestire la salute di cane, gatto e altri animali.
            Piano gratuito per 1 animale, nessuna carta richiesta.
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

          {/* Sezione 1 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Perché vaccinare cane e gatto
            </h2>
            <p>
              La vaccinazione stimola il sistema immunitario dell'animale a produrre anticorpi
              contro malattie infettive gravi, spesso mortali nei cuccioli. Senza vaccinazione,
              patologie come il cimurro, la parvovirosi o la panleucopenia felina hanno un tasso
              di mortalità molto elevato, soprattutto sotto i 6 mesi di età.
            </p>
            <p className="mt-2">
              Secondo PetNote, la difficoltà più comune non è decidere se vaccinare, ma ricordarsi
              quando farlo: i richiami hanno scadenze diverse per ogni vaccino e si perdono
              facilmente senza un sistema di promemoria.
            </p>
          </section>

          {/* Sezione 2 — obbligatorie vs facoltative */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Vaccini obbligatori e facoltativi in Italia
            </h2>
            <p className="mb-3">
              In Italia non esiste un obbligo vaccinale generalizzato per legge nazionale, con
              un'eccezione:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-900">Vaccino antirabbico:</strong> obbligatorio per
                cani e gatti che viaggiano all'estero (richiesto dal regolamento UE per il
                passaporto europeo per animali da compagnia) e in alcune aree indicate a rischio
                dalle autorità sanitarie regionali.
              </li>
              <li>
                <strong className="text-slate-900">Tutte le altre vaccinazioni</strong> (cimurro,
                parvovirosi, epatite, leptospirosi per il cane; panleucopenia, rinotracheite,
                calicivirosi per il gatto) sono raccomandate — non obbligatorie per legge, ma
                considerate standard di cura dalla comunità veterinaria (linee guida WSAVA) e
                spesso richieste da pensioni, canili e strutture di toelettatura.
              </li>
            </ul>
          </section>

          {/* Sezione 3 — calendario cane */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Calendario vaccinale del cane
            </h2>
            <p className="mb-3">
              Protocollo base secondo le linee guida WSAVA, adattabile dal veterinario in base a
              razza, stile di vita e area geografica:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-100 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-3 text-slate-700 font-semibold">Età</th>
                    <th className="text-left p-3 text-slate-700 font-semibold">Vaccinazione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr>
                    <td className="p-3 text-slate-600 font-medium">6–8 settimane</td>
                    <td className="p-3 text-slate-700">Prima dose: cimurro, parvovirosi, epatite</td>
                  </tr>
                  <tr className="bg-slate-50/40">
                    <td className="p-3 text-slate-600 font-medium">10–12 settimane</td>
                    <td className="p-3 text-slate-700">Richiamo + leptospirosi</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600 font-medium">14–16 settimane</td>
                    <td className="p-3 text-slate-700">Richiamo finale del ciclo cucciolo</td>
                  </tr>
                  <tr className="bg-slate-50/40">
                    <td className="p-3 text-slate-600 font-medium">12 mesi</td>
                    <td className="p-3 text-slate-700">Primo richiamo annuale completo</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600 font-medium">Adulto</td>
                    <td className="p-3 text-slate-700">Richiamo ogni 1–3 anni a seconda del vaccino</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-slate-500 text-xs">
              Il calendario esatto varia in base al vaccino usato dal veterinario (durata di
              protezione da 1 a 3 anni) — questa tabella è indicativa, non sostituisce il piano
              vaccinale prescritto dal tuo veterinario.
            </p>
          </section>

          {/* Sezione 4 — calendario gatto */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Calendario vaccinale del gatto
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-900">Panleucopenia felina (PF):</strong> prima dose
                a 8–9 settimane, richiamo a 12 settimane, poi annuale o triennale.
              </li>
              <li>
                <strong className="text-slate-900">Rinotracheite virale (FHV-1) e calicivirosi
                (FCV):</strong> incluse nel trivalente insieme alla panleucopenia, stesso schema.
              </li>
              <li>
                <strong className="text-slate-900">Leucemia felina (FeLV):</strong> raccomandata
                per gatti che escono di casa o convivono con altri gatti; due dosi iniziali a
                distanza di 3–4 settimane, poi richiamo annuale.
              </li>
            </ul>
            <p className="mt-3 text-slate-500 text-xs">
              Registra ogni vaccinazione in PetNote: l'app calcola automaticamente la prossima
              scadenza e invia un promemoria push 7 giorni prima.
            </p>
          </section>

          {/* Sezione 5 — costi */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Quanto costano i vaccini per cane e gatto in Italia
            </h2>
            <p className="mb-3">
              I prezzi variano per clinica, regione e tipo di vaccino. Stime indicative basate su
              tariffari veterinari pubblici:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Vaccino singolo (richiamo): <strong>€25–€45</strong></li>
              <li>Ciclo cucciolo completo (2–3 dosi): <strong>€80–€150</strong></li>
              <li>Vaccino antirabbico: <strong>€20–€35</strong></li>
              <li>Visita + vaccino incluso: <strong>€40–€70</strong></li>
            </ul>
            <p className="mt-3 text-slate-500 text-xs">
              Stime indicative, non un preventivo — il prezzo esatto dipende dalla clinica.
              Registra il costo di ogni vaccinazione in PetNote per avere sempre lo storico spese
              del tuo animale.
            </p>
          </section>

          {/* Sezione 6 — HowTo */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Come tracciare i vaccini del tuo animale con PetNote
            </h2>
            <p className="mb-4">
              Registrare le vaccinazioni su PetNote richiede meno di un minuto per ogni voce.
            </p>
            <ol className="space-y-4">
              {[
                {
                  n: '1',
                  t: 'Apri la sezione Vaccinazioni del tuo animale',
                  d: 'Dalla scheda del pet, entra nella sezione dedicata alle vaccinazioni.',
                },
                {
                  n: '2',
                  t: 'Inserisci nome vaccino, data e veterinario',
                  d: 'Aggiungi anche il numero di lotto se presente sul foglio del veterinario.',
                },
                {
                  n: '3',
                  t: 'Imposta la data del richiamo',
                  d: 'PetNote calcola automaticamente quando inviarti il promemoria push.',
                },
                {
                  n: '4',
                  t: 'Ricevi il promemoria in tempo',
                  d: 'Un avviso 7 giorni prima della scadenza, così non salti mai un richiamo.',
                },
                {
                  n: '5',
                  t: 'Condividi lo storico col veterinario',
                  d: 'Con la funzione Share Link il vet vede tutto lo storico vaccinale dal suo smartphone, senza account.',
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
                Traccia i vaccini gratis
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
                  q: 'Quali vaccini sono obbligatori per il cane in Italia?',
                  a: 'A livello nazionale l\'unico vaccino obbligatorio per legge è quello antirabbico, richiesto per i viaggi all\'estero e in alcune aree a rischio individuate dalle autorità regionali. Le altre vaccinazioni (cimurro, parvovirosi, epatite, leptospirosi) non sono obbligatorie per legge ma sono raccomandate dalla comunità veterinaria come standard di cura.',
                },
                {
                  q: 'Ogni quanto si fanno i richiami dei vaccini al cane?',
                  a: 'Dipende dal vaccino: alcuni richiedono richiamo annuale, altri ogni 3 anni. Il ciclo cucciolo prevede più dosi ravvicinate (6-8, 10-12, 14-16 settimane), poi si passa a un richiamo periodico da adulto. Il veterinario stabilisce lo schema esatto in base al prodotto usato.',
                },
                {
                  q: 'Un cane non vaccinato può andare al canile o in pensione?',
                  a: 'Nella pratica, la maggior parte di canili, pensioni e strutture di toelettatura in Italia richiede il libretto vaccinale aggiornato come condizione di accesso, anche se non è un obbligo di legge generale. Verifica sempre con la struttura specifica.',
                },
                {
                  q: 'Quanto costano i vaccini per un cane in Italia?',
                  a: 'Un richiamo singolo costa indicativamente €25–€45, mentre un ciclo cucciolo completo (2-3 dosi) va dagli €80 ai €150. I prezzi variano per regione e clinica veterinaria.',
                },
                {
                  q: 'Cosa succede se salto un richiamo vaccinale?',
                  a: 'Se il richiamo viene ritardato oltre la finestra consigliata, la protezione immunitaria può calare e in alcuni casi il veterinario consiglia di ripartire dal ciclo iniziale invece di fare solo il richiamo. Per questo un promemoria puntuale (come quello automatico di PetNote) è importante.',
                },
                {
                  q: 'Il vaccino antirabbico è obbligatorio anche per il gatto?',
                  a: 'Sì, le stesse regole del cane si applicano al gatto: obbligatorio per viaggi all\'estero con passaporto europeo per animali da compagnia e in aree a rischio indicate dalle autorità regionali.',
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
            Non dimenticare più un richiamo vaccinale
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
