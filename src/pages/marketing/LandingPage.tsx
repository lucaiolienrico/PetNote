import { Link } from 'react-router-dom'
import {
  Syringe, Stethoscope, Bug, Scale, Check, ArrowRight,
  Smartphone, Lock, CalendarClock, Star, StarHalf, Share2, ShoppingBag,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

const SUPPORT_EMAIL = 'supporto.petnote@gmail.com'

/**
 * Preview categorie prodotti in landing. Solo emoji+label: gli URL affiliati
 * vivono unicamente in ProdottiConsigliatiPage.tsx — importarli qui fonderebbe
 * i due chunk lazy, appesantendo la landing.
 */
const PRODUCT_CATEGORIES = [
  { emoji: '🐾', label: 'Crocchette' },
  { emoji: '🦟', label: 'Antiparassitari' },
  { emoji: '💊', label: 'Integratori' },
]

// Copy delle 4 sezioni sanitarie — stessa icona/ordine di PetDetailPage.tsx,
// per coerenza visiva reale col prodotto (non icone generiche inventate).
// 5a card (Share Link): stessa icona Share2 usata in ShareLinkModal.tsx e
// nell'header di PetDetailPage.tsx — hook di acquisizione canale vet, priorità
// strategica #1 da feature audit, prima assente da questa pagina.
// iconBg/iconText: stessi hue reali delle sezioni dell'app (sectionColors.ts),
// mappati 1:1 (vaccinations→blue, vet-visits→green, antiparasitics→amber,
// weight→violet). Share non è una sezione DB → resta brand, come in-app.
// Stringhe classe COMPLETE (mai template literal per i colori: Tailwind JIT).
const FEATURES = [
  {
    icon: Syringe,
    title: 'Vaccinazioni',
    body: 'Segna vaccino e data. PetNote calcola da solo quando è ora del richiamo.',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
  },
  {
    icon: Stethoscope,
    title: 'Visite veterinarie',
    body: 'Motivo, diagnosi, costo — uno storico consultabile in un tap, anche a distanza di anni.',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
  },
  {
    icon: Bug,
    title: 'Antiparassitari',
    body: 'Interno, esterno o entrambi. Mai più affidato alla memoria.',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
  },
  {
    icon: Scale,
    title: 'Peso nel tempo',
    body: 'Ogni misurazione diventa un punto su un grafico che racconta la crescita.',
    iconBg: 'bg-violet-100',
    iconText: 'text-violet-600',
  },
  {
    icon: Share2,
    title: 'Condividi col veterinario',
    body: 'Genera un link: il veterinario vede vaccinazioni, visite e trattamenti — senza account, senza stampare nulla.',
    iconBg: 'bg-brand-50',
    iconText: 'text-brand-600',
  },
] as const

const STEPS = [
  { n: '1', title: 'Crea un account', body: 'Email o Google, meno di un minuto.' },
  { n: '2', title: 'Aggiungi il tuo animale', body: 'Nome, specie, età — il resto è opzionale.' },
  { n: '3', title: 'Registra il primo evento', body: 'Un vaccino, una visita, un peso. PetNote tiene il resto in ordine.' },
] as const

type FaqItem = {
  q: string
  a: string
  /** Link opzionale alla pillar page correlata — solo per le domande di
   * dominio (vaccini/assicurazione/spese), non per le domande sull'app. */
  guide?: { to: string; label: string }
}

const FAQ: readonly FaqItem[] = [
  {
    q: 'Serve installare un\u2019app dallo store?',
    a: 'No. PetNote è un\u2019app web: apri il sito dal telefono e tocca \u201CAggiungi a schermata Home\u201D per averla come un\u2019icona vera, senza passare da App Store o Play Store.',
  },
  {
    q: 'Posso tracciare più di un animale?',
    a: 'Il piano Free include 1 animale, con 2 visite veterinarie e 1 allergia registrabili. Con Premium sblocchi vaccinazioni, antiparassitari, peso, assicurazioni e animali illimitati.',
  },
  {
    q: 'I miei dati sono privati?',
    a: 'Sì. Ogni animale è visibile solo dal suo proprietario: è una regola imposta a livello di database, non solo di interfaccia.',
  },
  {
    q: 'Posso disdire quando voglio?',
    a: 'Sì, in un tap dalle Impostazioni. Nessuna chiamata, nessuna email da scrivere.',
  },
  {
    q: 'Quali vaccini deve fare il mio cane o gatto?',
    a: 'Dipende da età e specie: nel primo anno servono più dosi ravvicinate, poi un richiamo periodico. In Italia solo il vaccino antirabbico è obbligatorio per legge (viaggi e aree a rischio); gli altri sono raccomandati dai veterinari.',
    guide: { to: '/guide/vaccini-cane-gatto', label: 'Calendario vaccinale completo' },
  },
  {
    q: 'Conviene fare l\u2019assicurazione al mio animale?',
    a: 'Dipende dal profilo di rischio: razza, età, stile di vita e storico clinico. Per un animale giovane e sano conviene confrontare il premio annuo col costo medio di un intervento chirurgico non pianificato.',
    guide: { to: '/guide/assicurazione-animali-domestici', label: 'Come funziona e cosa copre' },
  },
  {
    q: 'Le spese veterinarie sono detraibili dalla dichiarazione dei redditi?',
    a: 'No. La detrazione IRPEF del 19% (art. 15 TUIR) copre solo le spese sanitarie sostenute per persone, non per animali domestici.',
    guide: { to: '/guide/spese-veterinarie', label: 'Costi medi e come pianificare il budget' },
  },
]

// Recensioni reali di utenti verificati. Fornite direttamente da Enrico
// (product owner) — vedi sessione 2026-07-17. Rating in incrementi di 0.5.
const REVIEWS: readonly {
  name: string
  pet: string
  avatar: string
  rating: number
  quote: string
}[] = [
  {
    name: 'Corrado',
    pet: 'Proprietario di un cane',
    avatar: '🐕',
    rating: 5,
    quote: 'Prima impazzivo con le medicine del mio cane anziano e avevo il terrore di scordarmele. PetNote mi ha salvato la vita: ho tutti i promemoria sul telefono e non salto più una dose.',
  },
  {
    name: 'Gianni',
    pet: 'Proprietario di un cane',
    avatar: '🐕',
    rating: 5,
    quote: 'Finalmente in casa non facciamo più confusione su chi ha già portato fuori il cane. Segniamo tutto sull\u2019app in un attimo e le notifiche sono super precise. Mai più senza.',
  },
  {
    name: 'Miki',
    pet: 'Utente PetNote',
    avatar: '🐾',
    rating: 4.5,
    quote: 'Dimenticavo regolarmente quando dare l\u2019antiparassitario o fare i richiami dei vaccini. Adesso l\u2019app mi manda l\u2019avviso al momento giusto e sto tranquilla. Ottima, anche se la schermata iniziale si potrebbe alleggerire un po\u2019.',
  },
  {
    name: 'Francesca',
    pet: 'Proprietaria di una gatta',
    avatar: '🐈',
    rating: 4,
    quote: 'Tenere traccia a mano di tutto quello che serve per la mia gatta era un incubo, finivo sempre per perdere i foglietti. L\u2019app è comodissima per segnare tutto al volo.',
  },
] as const

export function LandingPage() {
  useDocumentMeta({
    title: 'PetNote — Gestione salute animali domestici',
    description:
      "Tieni traccia di vaccinazioni, visite veterinarie, antiparassitari e peso del tuo animale, tutto in un'unica app. Gratis per un animale.",
    canonicalPath: '/',
  })

  // L'href mailto: apre il client email di sistema quando presente (Outlook,
  // Apple Mail, app native mobile). Dove non c'è client configurato o dove
  // mailto: resta muto (Opera, Windows senza Outlook), la copia negli appunti
  // + toast garantiscono comunque l'accesso all'indirizzo: nessun canale cieco.
  const handleSupportClick = () => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(SUPPORT_EMAIL).then(
      () => toast.success(`Email supporto copiata: ${SUPPORT_EMAIL}`),
      () => {},
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <header className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-lg flex items-center gap-1.5">
            <span aria-hidden>🐾</span> PetNote
          </span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Accedi
            </Link>
            <Link
              to="/register"
              className="bg-brand-600 text-white text-sm font-semibold rounded-xl px-4 py-2 hover:bg-brand-700 transition-colors"
            >
              Registrati gratis
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
            Zero scadenze dimenticate. Solo tranquillità, per te e per lui.
          </h1>
          <p className="text-slate-700 text-lg font-semibold mt-3">
            Il libretto sanitario digitale per cane e gatto.
          </p>
          <p className="text-slate-600 text-base md:text-lg mt-5 max-w-md">
            Vaccinazioni, visite, antiparassitari e peso di cane, gatto, coniglio o qualsiasi altro animale.
            Un posto solo, sempre a portata di mano.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Link
              to="/register"
              className="flex items-center gap-1.5 bg-brand-600 text-white font-semibold rounded-xl px-5 py-3 text-sm hover:bg-brand-700 transition-colors"
            >
              Registra il tuo primo animale <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-5 py-3"
            >
              Ho già un account
            </Link>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-4">
            <Share2 size={13} className="text-brand-600 flex-shrink-0" />
            Condividi il libretto col veterinario in un tap, senza account per lui.
          </p>
        </div>

        {/* Signature: mockup "libretto" con timbro — stessa palette badge dell'app reale */}
        <div className="relative max-w-sm mx-auto md:max-w-none motion-safe:animate-[fadeUp_0.7s_ease-out_0.15s_forwards] motion-safe:opacity-0">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Media slot full-bleed, solo da md in su: su mobile la colonna e'
                gia' singola e la foto allungherebbe l'hero del ~24% (958 -> 1187px
                @375). aspect-ratio + width/height reali = box riservato prima del
                decode, zero CLS sull'LCP desktop. L'asset e' gia' ritagliato 2:1,
                quindi object-cover non ricampiona nulla. */}
            <img
              src="/hero-pet.webp"
              alt=""
              aria-hidden
              width={944}
              height={472}
              fetchPriority="high"
              decoding="async"
              className="hidden md:block w-full aspect-[2/1] object-cover bg-slate-100"
            />
            <div className="p-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                {/* Avatar reale al posto dell'emoji: l'app vera mostra qui la foto
                    del pet (pets.photo_url + bucket pet-photos), quindi il mockup
                    e' fedele al prodotto. Asset 128px = ~2.9x del reso 44px,
                    copre anche i display 3x. Unico media visibile sotto md. */}
                <img
                  src="/hero-pet-avatar.webp"
                  alt=""
                  aria-hidden
                  width={128}
                  height={128}
                  decoding="async"
                  className="w-11 h-11 rounded-full object-cover bg-brand-50 flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-slate-900 leading-tight">Luna</p>
                  <p className="text-xs text-slate-500">Cane · labrador · 3 anni</p>
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Syringe size={16} className="text-brand-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate">Trivalente</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-brand-50 text-brand-700">
                    In regola
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Stethoscope size={16} className="text-brand-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate">Visita di controllo</span>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">12 mar</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Bug size={16} className="text-brand-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate">Antiparassitario</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-red-50 text-red-600">
                    Scaduto
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Scale size={16} className="text-brand-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate">Peso</span>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">30,0 kg ↘</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badge: logo reale PetNote (asset /public/petnote-logo-badge.png) */}
          <img
            src="/petnote-logo-badge.webp"
            alt=""
            aria-hidden
            className="hidden sm:block absolute -top-5 -right-3 w-[72px] h-[72px] rounded-full shadow-sm"
          />
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-slate-100">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          Tutto quello che serve, niente di superfluo
        </h2>
        <p className="text-slate-600 text-center max-w-md mx-auto mb-10">
          Le cose che contano per ogni animale. Una sola app che se ne ricorda per te.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, body, iconBg, iconText }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
                <Icon size={22} className={iconText} />
              </div>
              <p className="font-semibold text-slate-900 mb-1">{title}</p>
              <p className="text-sm text-slate-600 leading-snug">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Come funziona — sequenza reale, numerazione giustificata */}
      <section className="bg-brand-50/40 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Come funziona</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="text-center sm:text-left">
                <span className="inline-flex w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold items-center justify-center mb-3">
                  {n}
                </span>
                <p className="font-semibold text-slate-900 mb-1">{title}</p>
                <p className="text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-slate-100">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Un piano per ogni esigenza</h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <p className="font-semibold text-slate-900">Free</p>
            <p className="text-3xl font-bold mt-2">€0</p>
            <p className="text-xs text-slate-500 mb-5">per sempre</p>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> 1 animale</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> 2 visite veterinarie</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> 1 allergia registrata</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border-2 border-brand-600 p-6 relative">
            <span className="absolute -top-3 right-6 bg-brand-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
              -42% annuale
            </span>
            <p className="font-semibold text-slate-900">Premium</p>
            <p className="text-3xl font-bold mt-2">€4,99<span className="text-sm font-normal text-slate-500">/mese</span></p>
            <p className="text-xs text-slate-500 mb-5">oppure €34,99/anno</p>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> Animali illimitati</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> Vaccinazioni, antiparassitari, peso</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> Visite e allergie illimitate</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-brand-600 flex-shrink-0" /> Assicurazioni, documenti, reminder</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Recensioni — placeholder strutturale, popolare REVIEWS a inizio file quando disponibili recensioni reali */}
      {REVIEWS.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-16 border-t border-slate-100">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Chi lo usa, lo conferma
          </h2>
          <p className="text-slate-600 text-center max-w-md mx-auto mb-10">
            Proprietari veri, animali veri.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REVIEWS.map(({ name, pet, avatar, rating, quote }) => (
              <div key={name} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col">
                <div
                  className="flex items-center gap-0.5 mb-3"
                  role="img"
                  aria-label={`Valutazione ${rating.toString().replace('.', ',')} su 5`}
                >
                  {Array.from({ length: 5 }).map((_, i) => {
                    const filled = i + 1 <= Math.floor(rating)
                    const isHalf = !filled && i < rating
                    if (isHalf) return <StarHalf key={i} size={14} className="text-brand-600 fill-brand-600" />
                    return (
                      <Star
                        key={i}
                        size={14}
                        className={filled ? 'text-brand-600 fill-brand-600' : 'text-slate-200 fill-slate-200'}
                      />
                    )
                  })}
                </div>
                <p className="text-sm text-slate-600 leading-snug mb-4 flex-1">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-2.5 pt-4 border-t border-slate-50">
                  <span className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-base flex-shrink-0" aria-hidden>
                    {avatar}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{name}</p>
                    <p className="text-xs text-slate-500">{pet}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fiducia — solo affermazioni verificabili, nessun numero inventato */}
      <section className="border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-16 grid sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div>
            <Lock size={20} className="text-teal-600 mx-auto sm:mx-0 mb-2" />
            <p className="font-semibold text-slate-900 text-sm">Dati privati per design</p>
            <p className="text-sm text-slate-600 mt-1">Ogni animale è visibile solo al suo proprietario, imposto a livello di database.</p>
          </div>
          <div>
            <Smartphone size={20} className="text-indigo-600 mx-auto sm:mx-0 mb-2" />
            <p className="font-semibold text-slate-900 text-sm">Nessun app store</p>
            <p className="text-sm text-slate-600 mt-1">È un'app web installabile: apri il sito, aggiungila alla schermata Home.</p>
          </div>
          <div>
            <CalendarClock size={20} className="text-pink-600 mx-auto sm:mx-0 mb-2" />
            <p className="font-semibold text-slate-900 text-sm">Scadenze sempre visibili</p>
            <p className="text-sm text-slate-600 mt-1">Ogni vaccino e trattamento mostra da solo se è in regola o scaduto.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16 border-t border-slate-100">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Domande frequenti</h2>
        <div className="space-y-6">
          {FAQ.map(({ q, a, guide }) => (
            <div key={q}>
              <p className="font-semibold text-slate-900">{q}</p>
              <p className="text-sm text-slate-600 mt-1">{a}</p>
              {guide && (
                <Link
                  to={guide.to}
                  className="text-sm text-brand-600 font-medium hover:text-blue-700 transition-colors inline-flex items-center gap-1 mt-2"
                >
                  {guide.label} <ArrowRight size={14} />
                </Link>
              )}
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
            Crea il libretto ora <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Prodotti consigliati — banda con preview delle 3 categorie.
          Le mini-card puntano alla pagina interna, MAI direttamente ad Amazon:
          la disclosure di affiliazione deve precedere l'uscita dal sito. */}
      <section className="border-t border-slate-100 bg-brand-50/40">
        <div className="max-w-5xl mx-auto px-4 py-14 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
            <ShoppingBag size={24} className="text-brand-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Prenditi cura del tuo pet, ogni giorno
          </h2>
          <p className="text-slate-600 mt-2 max-w-md">
            Crocchette, antiparassitari e integratori selezionati per cani e gatti.
          </p>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg mt-8">
            {PRODUCT_CATEGORIES.map(({ emoji, label }) => (
              <Link
                key={label}
                to="/prodotti-consigliati"
                className="bg-white rounded-2xl border border-slate-100 px-2 py-5 flex flex-col items-center gap-2 hover:border-brand-600 transition-colors"
              >
                <span className="text-2xl" aria-hidden>{emoji}</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          <Link
            to="/prodotti-consigliati"
            className="inline-flex items-center gap-1.5 bg-brand-600 text-white font-semibold rounded-xl px-6 py-3 text-sm mt-8 hover:bg-brand-700 transition-colors"
          >
            Vedi tutti i prodotti <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-8 text-sm text-slate-500">
          {/* Guide — link interno per crawlability. Footer presente solo qui
              (homepage), non condiviso con le altre pagine pubbliche: è comunque
              il punto d'ingresso a più alta link-authority del sito, altrimenti
              queste pillar page restano isole non raggiungibili dalla homepage. */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pb-5 mb-5 border-b border-slate-50">
            <Link to="/guide/libretto-sanitario-digitale-cane-gatto" className="hover:text-slate-600 transition-colors">Libretto sanitario digitale</Link>
            <Link to="/guide/vaccini-cane-gatto" className="hover:text-slate-600 transition-colors">Vaccini cane e gatto</Link>
            <Link to="/guide/assicurazione-animali-domestici" className="hover:text-slate-600 transition-colors">Assicurazione animali domestici</Link>
            <Link to="/guide/spese-veterinarie" className="hover:text-slate-600 transition-colors">Spese veterinarie</Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <span className="flex items-center gap-1.5">🐾 PetNote</span>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
              <Link to="/termini" className="hover:text-slate-600 transition-colors">Termini</Link>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                onClick={handleSupportClick}
                className="hover:text-slate-600 transition-colors"
              >
                Supporto
              </a>
              <Link to="/login" className="hover:text-slate-600 transition-colors">Accedi</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
