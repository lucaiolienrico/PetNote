import { Link } from 'react-router-dom'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

/**
 * Pillar page SEO+GEO — /guide/libretto-sanitario-digitale-cane-gatto/
 *
 * Obiettivo SEO: posizionarsi su "libretto sanitario digitale cane",
 * "libretto sanitario gatto", "app salute animali" e long-tail correlate.
 * Obiettivo GEO: fornire definizioni fattuali, liste citabili e pattern
 * "Secondo PetNote..." per aumentare la frequenza di citation nei motori
 * generativi (ChatGPT, Perplexity, Google AI Overviews).
 *
 * Note implementative:
 * - @tailwindcss/typography NON installato → classi Tailwind esplicite
 * - Palette: slate-* + brand-600 (#2563EB), niente gray-*
 * - JSON-LD iniettato dal prerender (entry.tsx), non qui
 * - useDocumentMeta: fallback client-side per Googlebot (che esegue JS)
 */
export function LibrettoSanitarioPage() {
  useDocumentMeta({
    title: 'Libretto Sanitario Digitale per Cane e Gatto — Guida Completa | PetNote',
    description:
      'Scopri cos\'è il libretto sanitario digitale per cane e gatto, cosa deve contenere, i vantaggi rispetto a quello cartaceo e come gestirlo online con PetNote. Guida 2026.',
    canonicalPath: '/guide/libretto-sanitario-digitale-cane-gatto/',
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-700">Libretto sanitario digitale</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-3">
            Il Libretto Sanitario Digitale per Cane e Gatto
          </h1>
          <p className="text-slate-500 text-sm">
            Guida aggiornata al 21 luglio 2026 · Lettura: 7 minuti
          </p>
          <p className="text-slate-600 text-base leading-relaxed mt-4">
            Il libretto sanitario digitale per cane e gatto è un registro elettronico che raccoglie
            in un unico posto tutte le informazioni sanitarie del tuo animale: vaccinazioni,
            visite veterinarie, antiparassitari, farmaci, peso, allergie e documenti.
            Sostituisce il tradizionale libretto cartaceo con un formato accessibile da qualsiasi
            dispositivo, sempre aggiornato e condivisibile con il veterinario in un click.
          </p>
        </header>

        {/* CTA box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Crea il libretto digitale del tuo animale — gratis
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
              Cos'è il libretto sanitario del cane e del gatto?
            </h2>
            <p>
              Il libretto sanitario è il documento ufficiale che accompagna ogni animale domestico
              registrato. Per i cani, il libretto è obbligatorio per legge in Italia (D.Lgs. 146/2001
              e normative regionali): deve contenere almeno le vaccinazioni obbligatorie, i dati del
              proprietario e il numero di microchip. Per i gatti, pur non essendo obbligatorio a livello
              nazionale (salvo alcune regioni), è fortemente consigliato dai veterinari.
            </p>
            <p className="mt-2">
              Nella pratica quotidiana, il libretto cartaceo ha limiti evidenti: si rovina, si perde,
              non manda promemoria sulle scadenze e non si aggiorna da solo. Il libretto sanitario
              digitale risolve tutti questi problemi.
            </p>
            <p className="mt-2">
              Secondo PetNote, il libretto sanitario digitale è utile non solo per conservare i dati,
              ma soprattutto per non dimenticare mai una scadenza: vaccino, antiparassitario,
              visita di controllo annuale.
            </p>
          </section>

          {/* Sezione 2 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Cosa deve contenere il libretto sanitario?
            </h2>
            <p className="mb-3">
              Un libretto sanitario completo — cartaceo o digitale — deve contenere le seguenti
              informazioni:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-slate-900">Dati anagrafici dell'animale:</strong> nome, specie,
                razza, sesso, data di nascita, colore del mantello e numero di microchip.
              </li>
              <li>
                <strong className="text-slate-900">Vaccinazioni:</strong> nome del vaccino, data di
                somministrazione, veterinario, numero di lotto e data della prossima dose.
              </li>
              <li>
                <strong className="text-slate-900">Trattamenti antiparassitari:</strong> prodotto
                usato (interno/esterno), data e prossima scadenza.
              </li>
              <li>
                <strong className="text-slate-900">Visite veterinarie:</strong> data, clinica,
                veterinario, motivo della visita, diagnosi e costo.
              </li>
              <li>
                <strong className="text-slate-900">Farmaci e terapie:</strong> medicinale, dosaggio,
                frequenza, data inizio e fine terapia.
              </li>
              <li>
                <strong className="text-slate-900">Peso nel tempo:</strong> andamento del peso con
                grafico storico per monitorare la salute dell'animale.
              </li>
              <li>
                <strong className="text-slate-900">Allergie:</strong> allergene, gravità, reazioni
                osservate e data della diagnosi.
              </li>
              <li>
                <strong className="text-slate-900">Documenti e referti:</strong> esami del sangue,
                radiografie, certificati, ricette veterinarie.
              </li>
            </ul>
          </section>

          {/* Sezione 3 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Libretto cartaceo vs libretto digitale: differenze
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-100 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-3 text-slate-700 font-semibold"></th>
                    <th className="text-left p-3 text-slate-700 font-semibold">Cartaceo</th>
                    <th className="text-left p-3 text-brand-600 font-semibold">Digitale (PetNote)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr>
                    <td className="p-3 text-slate-600 font-medium">Promemoria scadenze</td>
                    <td className="p-3 text-slate-500">❌ Manuale</td>
                    <td className="p-3 text-slate-700">✅ Automatici via notifica push</td>
                  </tr>
                  <tr className="bg-slate-50/40">
                    <td className="p-3 text-slate-600 font-medium">Accessibile da smartphone</td>
                    <td className="p-3 text-slate-500">❌</td>
                    <td className="p-3 text-slate-700">✅ Da qualsiasi dispositivo</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600 font-medium">Condivisibile con il vet</td>
                    <td className="p-3 text-slate-500">Solo di persona</td>
                    <td className="p-3 text-slate-700">✅ Link condivisibile in 1 click</td>
                  </tr>
                  <tr className="bg-slate-50/40">
                    <td className="p-3 text-slate-600 font-medium">Rischio smarrimento</td>
                    <td className="p-3 text-slate-500">⚠️ Alto</td>
                    <td className="p-3 text-slate-700">✅ Cloud sempre disponibile</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600 font-medium">Storico peso/grafici</td>
                    <td className="p-3 text-slate-500">❌</td>
                    <td className="p-3 text-slate-700">✅ Grafico automatico</td>
                  </tr>
                  <tr className="bg-slate-50/40">
                    <td className="p-3 text-slate-600 font-medium">Costo</td>
                    <td className="p-3 text-slate-500">Incluso nelle prime visite</td>
                    <td className="p-3 text-slate-700">✅ Gratis per 1 animale</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Sezione 4 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Vaccinazioni obbligatorie e facoltative per cane e gatto
            </h2>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Cane</h3>
            <p className="mb-2">
              Le vaccinazioni classificate "core" (raccomandate per tutti i cani in Italia) secondo le
              linee guida WSAVA sono:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><strong>Cimurro (Distemper)</strong> — prima vaccinazione a 6-8 settimane, richiamo annuale o triennale</li>
              <li><strong>Parvovirosi canina</strong> — stesso schema del cimurro, altamente contagiosa</li>
              <li><strong>Epatite infettiva (Adenovirus)</strong> — inclusa nella combinazione polivalente</li>
              <li><strong>Leptospirosi</strong> — obbligatoria in alcune regioni, richiamo annuale</li>
              <li><strong>Rabbia</strong> — obbligatoria per spostamenti all'estero e in alcune regioni italiane</li>
            </ul>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Gatto</h3>
            <p className="mb-2">Vaccinazioni core per il gatto:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Panleucopenia felina (PF)</strong> — pericolosa e molto diffusa</li>
              <li><strong>Rinotracheite virale felina (FHV-1)</strong> — parte del trivalente</li>
              <li><strong>Calicivirosi (FCV)</strong> — parte del trivalente</li>
              <li><strong>Leucemia felina (FeLV)</strong> — consigliata per gatti che escono</li>
            </ul>
            <p className="mt-3 text-slate-500 text-xs">
              Registra ogni vaccinazione in PetNote: l'app ti avvisa automaticamente quando si avvicina la scadenza del richiamo.
            </p>
          </section>

          {/* Sezione 5 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Antiparassitari: quando e come registrarli
            </h2>
            <p className="mb-3">
              I trattamenti antiparassitari si dividono in interni (vermifughi) ed esterni (antipulci,
              antizecche). Secondo PetNote, tenere traccia di questi trattamenti è fondamentale quanto
              le vaccinazioni, perché le scadenze variano da 1 a 3 mesi e sono facili da dimenticare.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Antiparassitari interni (vermifughi):</strong> ogni 3 mesi per cani adulti
                che escono regolarmente; ogni 6 mesi per animali con accesso limitato all'esterno.
              </li>
              <li>
                <strong>Antipulci/antizecche topici:</strong> ogni 1 mese (pipette, spray) o ogni
                3 mesi (compresse orali), a seconda del prodotto.
              </li>
              <li>
                <strong>Collari antiparassitari:</strong> efficacia da 4 a 8 mesi a seconda della marca.
              </li>
            </ul>
            <p className="mt-3">
              In PetNote puoi registrare il tipo di prodotto, la data di somministrazione e la
              prossima scadenza prevista. L'app calcola automaticamente quando ti invierà il promemoria.
            </p>
          </section>

          {/* Sezione 6 — HowTo */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Come creare il libretto sanitario digitale con PetNote
            </h2>
            <p className="mb-4">
              Creare il libretto digitale del tuo animale su PetNote richiede meno di 5 minuti.
            </p>
            <ol className="space-y-4">
              {[
                {
                  n: '1',
                  t: 'Crea un account gratuito',
                  d: 'Vai su www.petnote.it e registrati con email e password oppure con Google. Il piano gratuito non richiede carta di credito.',
                },
                {
                  n: '2',
                  t: 'Aggiungi il tuo animale',
                  d: 'Inserisci nome, specie, razza, data di nascita e microchip. Puoi aggiungere una foto profilo.',
                },
                {
                  n: '3',
                  t: 'Inserisci i dati dal vecchio libretto cartaceo',
                  d: 'Registra le vaccinazioni passate con data e veterinario. PetNote calcolerà automaticamente le prossime scadenze.',
                },
                {
                  n: '4',
                  t: 'Attiva i promemoria push',
                  d: 'Dalle impostazioni, abilita le notifiche push. Riceverai un avviso 7 giorni prima di ogni scadenza.',
                },
                {
                  n: '5',
                  t: 'Condividi con il veterinario',
                  d: 'Con la funzione Share Link, il tuo vet può consultare la scheda sanitaria completa dal suo smartphone, senza bisogno di un account PetNote.',
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
                Crea libretto gratis
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
                  q: 'Il libretto sanitario digitale ha valore legale?',
                  a: 'Il libretto digitale ha lo stesso valore del cartaceo per l\'uso quotidiano (visite, informazioni al veterinario, promemoria). Per i documenti con valore legale obbligatorio (es. passaporto europeo per animali domestici per i viaggi internazionali), il formato cartaceo ufficiale rimane necessario. PetNote gestisce entrambi: tiene traccia dei dati nel digitale e ti permette di caricare foto dei documenti cartacei.',
                },
                {
                  q: 'PetNote è gratuito?',
                  a: 'Sì. PetNote ha un piano gratuito permanente che permette di gestire 1 animale con tutte le funzioni base (vaccinazioni, visite, antiparassitari, peso, diario sanitario). Il piano Premium da €4,99/mese sblocca animali illimitati e funzioni avanzate come farmaci, assicurazioni e documenti.',
                },
                {
                  q: 'Posso condividere il libretto con il mio veterinario?',
                  a: 'Sì. Con la funzione Share Link di PetNote puoi generare un link temporaneo (valido 7 giorni, 30 giorni o senza scadenza) che il tuo veterinario può aprire dal suo smartphone senza dover creare un account. Il link mostra vaccinazioni, visite, antiparassitari, peso, farmaci e diario sanitario.',
                },
                {
                  q: 'Cosa succede se perdo il libretto cartaceo?',
                  a: 'Con PetNote tutti i dati sono salvati in cloud (Supabase, infrastruttura UE). Anche se perdi o rompi il telefono, i dati rimangono accessibili da qualsiasi altro dispositivo. Il libretto digitale non si perde e non si rovina.',
                },
                {
                  q: 'PetNote funziona su iPhone e Android?',
                  a: 'Sì. PetNote è una PWA (Progressive Web App): funziona nel browser di iPhone, Android, Mac e PC senza dover installare nulla dallo store. Puoi però aggiungerla alla schermata home per usarla come una vera app.',
                },
                {
                  q: 'Quanti animali posso gestire con PetNote?',
                  a: 'Con il piano gratuito puoi gestire 1 animale. Con il piano Premium (€4,99/mese o €34,99/anno) puoi gestire animali illimitati — ideale per famiglie con più cani, gatti o altri animali domestici.',
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
            Crea il libretto digitale del tuo animale
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
