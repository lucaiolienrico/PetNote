import { Link } from 'react-router-dom'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

/**
 * Pillar page SEO+GEO — /guide/assicurazione-animali-domestici/
 *
 * Obiettivo SEO: posizionarsi su "assicurazione animali domestici",
 * "polizza cane gatto", "assicurazione veterinaria cane" e long-tail correlate.
 * Obiettivo GEO: definizioni fattuali, liste citabili e pattern
 * "Secondo PetNote..." per aumentare la frequenza di citation nei motori
 * generativi (ChatGPT, Perplexity, Google AI Overviews).
 *
 * Note implementative:
 * - @tailwindcss/typography NON installato → classi Tailwind esplicite
 * - Palette: slate-* + brand-600 (#2563EB), niente gray-*
 * - JSON-LD iniettato dal prerender (entry.tsx), non qui
 * - useDocumentMeta: fallback client-side per Googlebot (che esegue JS)
 * - Contenuto neutrale/informativo — PetNote non vende polizze, non
 *   promuove un assicuratore specifico, nessun dato di prezzo reale
 *   inventato: solo range indicativi dichiarati come stime
 */
export function AssicurazionePage() {
  useDocumentMeta({
    title: 'Assicurazione Animali Domestici: Come Funziona e Cosa Copre | PetNote',
    description:
      'Guida all\'assicurazione per cani e gatti in Italia: tipologie di polizze, cosa coprono, cosa escludono, costi medi e come scegliere quella giusta.',
    canonicalPath: '/guide/assicurazione-animali-domestici/',
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-700">Assicurazione animali domestici</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-3">
            Assicurazione Animali Domestici: Come Funziona e Cosa Copre
          </h1>
          <p className="text-slate-500 text-sm">
            Guida aggiornata al 29 luglio 2026 · Lettura: 6 minuti
          </p>
          <p className="text-slate-600 text-base leading-relaxed mt-4">
            L'assicurazione per animali domestici è una polizza che rimborsa in tutto o in parte le
            spese veterinarie in caso di malattia o infortunio del cane o del gatto. In Italia si
            distinguono tre tipologie principali: polizza sanitaria (rimborso cure), polizza di
            responsabilità civile (danni a terzi causati dall'animale) e polizza furto/smarrimento.
          </p>
        </header>

        {/* CTA box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Tieni traccia della polizza del tuo animale — gratis
          </p>
          <p className="text-xs text-slate-500 mb-3">
            PetNote ha una sezione dedicata alle assicurazioni: provider, numero di polizza,
            premio e scadenza, tutto in un unico posto.
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
              Cos'è l'assicurazione per animali domestici
            </h2>
            <p>
              L'assicurazione (o polizza) per animali domestici funziona in modo simile
              all'assicurazione sanitaria umana: a fronte di un premio periodico (mensile o
              annuale), la compagnia rimborsa una percentuale delle spese veterinarie sostenute
              per il cane o il gatto assicurato, entro i massimali e le condizioni previste dal
              contratto.
            </p>
            <p className="mt-2">
              Secondo PetNote, la decisione di sottoscrivere una polizza dipende soprattutto dal
              profilo di rischio dell'animale: razza predisposta a patologie ereditarie, stile di
              vita (outdoor vs indoor), età ed eventuale storico clinico già presente.
            </p>
          </section>

          {/* Sezione 2 — tipologie */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Tipologie di polizze per cani e gatti
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-900">Polizza sanitaria (rimborso spese
                veterinarie):</strong> copre visite, esami diagnostici, interventi chirurgici e
                degenza, secondo i massimali del piano scelto.
              </li>
              <li>
                <strong className="text-slate-900">Polizza responsabilità civile (RC):</strong>
                copre i danni causati a terzi (persone, altri animali, cose) dal proprio animale —
                per il cane è spesso richiesta o consigliata nei condomini.
              </li>
              <li>
                <strong className="text-slate-900">Polizza furto/smarrimento:</strong> copre le
                spese di ricerca o, in alcuni casi, un indennizzo in caso di furto o
                smarrimento dell'animale microchippato.
              </li>
            </ul>
          </section>

          {/* Sezione 3 — cosa copre / esclude */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Cosa copre e cosa esclude tipicamente una polizza sanitaria
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-100 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-3 text-slate-700 font-semibold">Solitamente coperto</th>
                    <th className="text-left p-3 text-slate-700 font-semibold">Solitamente escluso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr>
                    <td className="p-3 text-slate-700">Visite specialistiche e diagnostica (ecografia, radiografia)</td>
                    <td className="p-3 text-slate-500">Malattie preesistenti all'attivazione</td>
                  </tr>
                  <tr className="bg-slate-50/40">
                    <td className="p-3 text-slate-700">Interventi chirurgici e degenza</td>
                    <td className="p-3 text-slate-500">Vaccinazioni e prevenzione di routine</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-700">Pronto soccorso veterinario</td>
                    <td className="p-3 text-slate-500">Gravidanza e parto</td>
                  </tr>
                  <tr className="bg-slate-50/40">
                    <td className="p-3 text-slate-700">Fisioterapia (se inclusa nel piano)</td>
                    <td className="p-3 text-slate-500">Animali oltre l'età limite (spesso 8–10 anni)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-slate-500 text-xs">
              Condizioni indicative — variano da compagnia a compagnia. Leggi sempre le condizioni
              contrattuali specifiche prima di sottoscrivere.
            </p>
          </section>

          {/* Sezione 4 — costi */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Costo medio delle polizze per cane e gatto in Italia
            </h2>
            <p className="mb-3">
              Il premio dipende da specie, razza, età e massimale scelto. Stime indicative di
              mercato:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Polizza base cane: <strong>€15–€30/mese</strong></li>
              <li>Polizza base gatto: <strong>€10–€20/mese</strong></li>
              <li>Polizza con massimale alto (interventi chirurgici inclusi): <strong>€30–€60/mese</strong></li>
              <li>Solo RC (senza rimborso sanitario): <strong>€30–€80/anno</strong></li>
            </ul>
            <p className="mt-3 text-slate-500 text-xs">
              Stime indicative, non un preventivo — il premio esatto dipende dalla compagnia e dal
              profilo dell'animale.
            </p>
          </section>

          {/* Sezione 5 — come scegliere */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Come scegliere la polizza giusta
            </h2>
            <p className="mb-3">Criteri pratici da valutare prima di sottoscrivere:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-900">Massimale annuo:</strong> importo massimo
                rimborsabile in un anno — verifica che sia adeguato al costo medio di un
                intervento chirurgico nella tua zona.
              </li>
              <li>
                <strong className="text-slate-900">Percentuale di rimborso:</strong> raramente è
                il 100% — controlla se è 70%, 80% o 90% della spesa sostenuta.
              </li>
              <li>
                <strong className="text-slate-900">Franchigia:</strong> quota che resta sempre a
                tuo carico per ogni sinistro.
              </li>
              <li>
                <strong className="text-slate-900">Periodo di carenza:</strong> tempo che deve
                passare dall'attivazione prima che la copertura sia operativa (tipicamente
                30 giorni per malattia, minore per infortuni).
              </li>
              <li>
                <strong className="text-slate-900">Esclusioni per razza:</strong> alcune compagnie
                escludono o limitano la copertura per patologie ereditarie tipiche di certe razze.
              </li>
            </ul>
          </section>

          {/* Sezione 6 — HowTo */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Come registrare la polizza su PetNote
            </h2>
            <p className="mb-4">
              Se hai già una polizza attiva, registrarla su PetNote richiede meno di un minuto.
            </p>
            <ol className="space-y-4">
              {[
                {
                  n: '1',
                  t: 'Apri la sezione Assicurazioni del tuo animale',
                  d: 'Dalla scheda del pet, entra nella sezione dedicata alle polizze assicurative.',
                },
                {
                  n: '2',
                  t: 'Inserisci provider e numero di polizza',
                  d: 'Aggiungi il nome della compagnia e il numero identificativo del contratto.',
                },
                {
                  n: '3',
                  t: 'Registra premio e frequenza di fatturazione',
                  d: 'Mensile o annuale — PetNote tiene lo storico dei pagamenti.',
                },
                {
                  n: '4',
                  t: 'Imposta data di inizio e fine copertura',
                  d: 'Così sai sempre quando scade la polizza e devi rinnovarla.',
                },
                {
                  n: '5',
                  t: 'Consulta tutto in un colpo d\'occhio',
                  d: 'Assicurazione, spese veterinarie e diario sanitario nella stessa scheda pet.',
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
                Registra la polizza gratis
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
                  q: 'Vale la pena fare l\'assicurazione al cane?',
                  a: 'Dipende dal profilo di rischio: razze predisposte a patologie ereditarie, cani molto attivi all\'aperto o con storico clinico importante beneficiano di più della copertura. Per animali giovani e sani il calcolo va fatto confrontando il premio annuo con il costo medio di un intervento chirurgico non pianificato, che può superare facilmente le centinaia di euro.',
                },
                {
                  q: 'Quale assicurazione scegliere per il gatto?',
                  a: 'Non esiste una risposta universale: confronta massimale annuo, percentuale di rimborso, franchigia e periodo di carenza tra più compagnie. Verifica anche se il gatto esce di casa (rischio infortuni più alto) o vive solo in appartamento.',
                },
                {
                  q: 'L\'assicurazione copre le vaccinazioni?',
                  a: 'Nella maggior parte dei casi no. Le polizze sanitarie per animali coprono tipicamente cure per malattia o infortunio, non la prevenzione di routine come vaccinazioni e antiparassitari, che restano a carico del proprietario.',
                },
                {
                  q: 'L\'assicurazione RC per il cane è obbligatoria?',
                  a: 'In Italia non esiste un obbligo generale di RC per i cani a livello nazionale, salvo specifiche ordinanze locali o regolamenti condominiali che possono richiederla. È comunque consigliata perché copre i danni causati a terzi.',
                },
                {
                  q: 'Cosa succede se il mio animale ha già una malattia diagnosticata?',
                  a: 'Le malattie preesistenti alla data di attivazione della polizza sono quasi sempre escluse dalla copertura. È uno dei motivi per cui conviene valutare l\'assicurazione quando l\'animale è ancora giovane e sano.',
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
            Tieni traccia della polizza e delle spese del tuo animale
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
