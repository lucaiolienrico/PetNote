import { Link } from 'react-router-dom'
import {
  Syringe, Stethoscope, Bug, Scale, Check, ArrowRight,
  Smartphone, Lock, CalendarClock,
} from 'lucide-react'

// Copy delle 4 sezioni sanitarie — stessa icona/ordine di PetDetailPage.tsx,
// per coerenza visiva reale col prodotto (non icone generiche inventate).
const FEATURES = [
  {
    icon: Syringe,
    title: 'Vaccinazioni',
    body: 'Segna vaccino e data. PetNote calcola da solo quando è ora del richiamo.',
  },
  {
    icon: Stethoscope,
    title: 'Visite veterinarie',
    body: 'Motivo, diagnosi, costo — uno storico consultabile in un tap, anche a distanza di anni.',
  },
  {
    icon: Bug,
    title: 'Antiparassitari',
    body: 'Interno, esterno o entrambi. Mai più affidato alla memoria.',
  },
  {
    icon: Scale,
    title: 'Peso nel tempo',
    body: 'Ogni misurazione diventa un punto su un grafico che racconta la crescita.',
  },
] as const

const STEPS = [
  { n: '1', title: 'Crea un account', body: 'Email o Google, meno di un minuto.' },
  { n: '2', title: 'Aggiungi il tuo animale', body: 'Nome, specie, età — il resto è opzionale.' },
  { n: '3', title: 'Registra il primo evento', body: 'Un vaccino, una visita, un peso. PetNote tiene il resto in ordine.' },
] as const

const FAQ = [
  {
    q: 'Serve installare un\u2019app dallo store?',
    a: 'No. PetNote è un\u2019app web: apri il sito dal telefono e tocca \u201CAggiungi a schermata Home\u201D per averla come un\u2019icona vera, senza passare da App Store o Play Store.',
  },
  {
    q: 'Posso tracciare più di un animale?',
    a: 'Il piano Free include 1 animale con tutte le funzionalità sanitarie. Con Premium gli animali sono illimitati.',
  },
  {
    q: 'I miei dati sono privati?',
    a: 'Sì. Ogni animale è visibile solo dal suo proprietario: è una regola imposta a livello di database, non solo di interfaccia.',
  },
  {
    q: 'Posso disdire quando voglio?',
    a: 'Sì, in un tap dalle Impostazioni. Nessuna chiamata, nessuna email da scrivere.',
  },
] as const

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-lg flex items-center gap-1.5">
            <span aria-hidden>🐾</span> PetNote
          </span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Accedi
            </Link>
            <Link
              to="/register"
              className="bg-brand-600 text-white text-sm font-semibold rounded-xl px-4 py-2 hover:bg-brand-700 transition-colors"
            >
              Inizia gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="motion-safe:animate-[fadeUp_0.7s_ease-out_forwards] motion-safe:opacity-0">
          <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase mb-4">
            Gratis per sempre per 1 animale
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.08]">
            Il libretto sanitario che tiene traccia al posto tuo.
          </h1>
          <p className="text-gray-500 text-base md:text-lg mt-5 max-w-md">
            Vaccinazioni, visite, antiparassitari e peso di cane, gatto, coniglio o qualsiasi altro animale.
            Un posto solo, sempre a portata di mano.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Link
              to="/register"
              className="flex items-center gap-1.5 bg-brand-600 text-white font-semibold rounded-xl px-5 py-3 text-sm hover:bg-brand-700 transition-colors"
            >
              Inizia gratis <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-5 py-3"
            >
              Ho già un account
            </Link>
          </div>
        </div>

        {/* Signature: mockup "libretto" con timbro — stessa palette badge dell'app reale */}
        <div className="relative motion-safe:animate-[fadeUp_0.7s_ease-out_0.15s_forwards] motion-safe:opacity-0">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 max-w-sm mx-auto">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="w-11 h-11 rounded-full bg-brand-50 flex items-center justify-center text-xl flex-shrink-0">
                🐕
              </div>
              <div>
                <p className="font-semibold text-gray-900 leading-tight">Luna</p>
                <p className="text-xs text-gray-400">Cane · labrador · 3 anni</p>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Syringe size={16} className="text-brand-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">Trivalente</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-brand-50 text-brand-700">
                  In regola
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Bug size={16} className="text-brand-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">Advantics</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-red-50 text-red-600">
                  Scaduto
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Scale size={16} className="text-brand-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">Peso</span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">30,0 kg ↘</span>
              </div>
            </div>
          </div>

          {/* Timbro — l'unico elemento "audace" della pagina, il resto resta disciplinato */}
          <div
            aria-hidden
            className="hidden sm:flex absolute -top-5 -right-3 w-20 h-20 rounded-full border-2 border-dashed border-brand-700 items-center justify-center rotate-[-10deg] mix-blend-multiply bg-white/60"
          >
            <span className="text-[10px] font-bold tracking-widest text-brand-700 text-center leading-tight">
              PET<br />NOTE
            </span>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          Tutto quello che serve, niente di superfluo
        </h2>
        <p className="text-gray-500 text-center max-w-md mx-auto mb-10">
          Quattro cose da ricordare per ogni animale. Una sola app che se ne ricorda per te.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5">
              <Icon size={22} className="text-brand-600 mb-3" />
              <p className="font-semibold text-gray-900 mb-1">{title}</p>
              <p className="text-sm text-gray-500 leading-snug">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Come funziona — sequenza reale, numerazione giustificata */}
      <section className="bg-brand-50/40 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Come funziona</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="text-center sm:text-left">
                <span className="inline-flex w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold items-center justify-center mb-3">
                  {n}
                </span>
                <p className="font-semibold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Un piano per ogni esigenza</h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="font-semibold text-gray-900">Free</p>
            <p className="text-3xl font-bold mt-2">€0</p>
            <p className="text-xs text-gray-400 mb-5">per sempre</p>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> 1 animale</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> Vaccinazioni, visite, antiparassitari</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> Grafico peso</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border-2 border-brand-600 p-6 relative">
            <span className="absolute -top-3 right-6 bg-brand-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
              -42% annuale
            </span>
            <p className="font-semibold text-gray-900">Premium</p>
            <p className="text-3xl font-bold mt-2">€4,99<span className="text-sm font-normal text-gray-400">/mese</span></p>
            <p className="text-xs text-gray-400 mb-5">oppure €34,99/anno</p>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> Animali illimitati</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> Tutto quello che c'è nel Free</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> Disdici quando vuoi, in un tap</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Fiducia — solo affermazioni verificabili, nessun numero inventato */}
      <section className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-14 grid sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div>
            <Lock size={20} className="text-brand-600 mx-auto sm:mx-0 mb-2" />
            <p className="font-semibold text-gray-900 text-sm">Dati privati per design</p>
            <p className="text-sm text-gray-500 mt-1">Ogni animale è visibile solo al suo proprietario, imposto a livello di database.</p>
          </div>
          <div>
            <Smartphone size={20} className="text-brand-600 mx-auto sm:mx-0 mb-2" />
            <p className="font-semibold text-gray-900 text-sm">Nessun app store</p>
            <p className="text-sm text-gray-500 mt-1">È un'app web installabile: apri il sito, aggiungila alla schermata Home.</p>
          </div>
          <div>
            <CalendarClock size={20} className="text-brand-600 mx-auto sm:mx-0 mb-2" />
            <p className="font-semibold text-gray-900 text-sm">Scadenze sempre visibili</p>
            <p className="text-sm text-gray-500 mt-1">Ogni vaccino e trattamento mostra da solo se è in regola o scaduto.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16 border-t border-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Domande frequenti</h2>
        <div className="space-y-6">
          {FAQ.map(({ q, a }) => (
            <div key={q}>
              <p className="font-semibold text-gray-900">{q}</p>
              <p className="text-sm text-gray-500 mt-1">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA finale */}
      <section className="bg-brand-600">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Il tuo animale merita di essere seguito bene.
          </h2>
          <p className="text-brand-50 mb-7">Aggiungi il primo animale in meno di un minuto. Gratis.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 bg-white text-brand-700 font-semibold rounded-xl px-6 py-3 text-sm hover:bg-brand-50 transition-colors"
          >
            Inizia gratis <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">🐾 PetNote</span>
          <Link to="/login" className="hover:text-gray-600 transition-colors">Accedi</Link>
        </div>
      </footer>
    </div>
  )
}
