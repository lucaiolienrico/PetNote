import { LegalPageLayout, LegalSection, LegalList } from '@/components/shared/LegalPageLayout'

/**
 * BOZZA tecnica — contenuto basato sui dati realmente raccolti (verificato
 * contro lo schema Supabase e i processor effettivi al 2026-07-13), NON
 * consulenza legale. Va fatta rivedere da un professionista privacy/legale
 * prima di un lancio con utenti reali, in particolare le sezioni su base
 * giuridica del trattamento, retention e titolare (dati fiscali P.IVA quando
 * disponibili).
 */
export function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Informativa sulla privacy" lastUpdated="13 luglio 2026">
      <LegalSection heading="1. Titolare del trattamento">
        <p>
          Il titolare del trattamento dei dati raccolti tramite PetNote è Enrico Lucaioli,
          contattabile all'indirizzo{' '}
          <a href="mailto:lucaiolienrico@gmail.com" className="text-brand-600 underline">lucaiolienrico@gmail.com</a>.
        </p>
      </LegalSection>

      <LegalSection heading="2. Dati raccolti">
        <p>Per fornire il servizio raccogliamo:</p>
        <LegalList
          items={[
            <><strong>Dati account:</strong> nome, indirizzo email, password (memorizzata solo come hash, mai in chiaro).</>,
            <><strong>Dati sugli animali:</strong> nome, specie, razza, data di nascita, microchip, foto, e le informazioni sanitarie che scegli di inserire (vaccinazioni, visite veterinarie, antiparassitari, farmaci, peso, allergie, assicurazioni, documenti, diario sanitario, promemoria). Sono dati che riguardano il tuo animale, non dati sanitari "particolari" ai sensi dell'art. 9 GDPR (che si applica solo a persone fisiche).</>,
            <><strong>Dati di abbonamento:</strong> stato del piano (Free/Premium) e identificativo della sottoscrizione PayPal. Non gestiamo né memorizziamo dati della tua carta o conto: il pagamento è gestito interamente da PayPal.</>,
            <><strong>Dati per le notifiche push:</strong> se attivi i promemoria push, il tuo browser genera un endpoint e delle chiavi di cifratura che salviamo per poterti inviare la notifica.</>,
            <><strong>Dati tecnici minimi:</strong> log applicativi standard (per sicurezza e debug), nessun cookie di profilazione — vedi la sezione Cookie qui sotto.</>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. Perché trattiamo questi dati">
        <LegalList
          items={[
            <><strong>Esecuzione del contratto</strong> (art. 6.1.b GDPR): creare il tuo account, mostrarti i dati dei tuoi animali, gestire l'abbonamento Premium.</>,
            <><strong>Consenso</strong> (art. 6.1.a GDPR): invio di notifiche push per promemoria di scadenze — attivabile e disattivabile in qualsiasi momento dalle impostazioni del browser/app.</>,
            <><strong>Legittimo interesse</strong> (art. 6.1.f GDPR): sicurezza del servizio, prevenzione abusi, log tecnici con retention minima.</>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Con chi condividiamo i dati">
        <p>Usiamo i seguenti fornitori (sub-responsabili del trattamento), scelti perché necessari a far funzionare il servizio:</p>
        <LegalList
          items={[
            <><strong>Supabase</strong> (database, autenticazione, storage file) — infrastruttura ospitata nella regione UE (Irlanda).</>,
            <><strong>PayPal</strong> (elaborazione pagamenti abbonamento) — riceve solo i dati necessari a processare il pagamento, secondo la{' '}
              <a href="https://www.paypal.com/it/webapps/mpp/ua/privacy-full" target="_blank" rel="noreferrer" className="text-brand-600 underline">informativa privacy di PayPal</a>.</>,
            <><strong>Vercel</strong> (hosting ed erogazione dell'applicazione web).</>,
            <><strong>Resend</strong> (invio email transazionali, es. conferme — se e quando attivo).</>,
          ]}
        />
        <p>Non vendiamo né condividiamo i tuoi dati con terze parti a fini pubblicitari.</p>
      </LegalSection>

      <LegalSection heading="5. Per quanto tempo conserviamo i dati">
        <p>
          Conserviamo i dati del tuo account e dei tuoi animali finché l'account resta attivo.
          Se richiedi la cancellazione dell'account, i dati vengono eliminati entro un tempo
          ragionevole, salvo gli obblighi di legge che richiedano una conservazione più lunga
          (es. dati fiscali relativi a pagamenti).
        </p>
      </LegalSection>

      <LegalSection heading="6. I tuoi diritti">
        <p>Hai diritto, in qualsiasi momento, di richiedere:</p>
        <LegalList
          items={[
            'accesso ai tuoi dati personali',
            'rettifica di dati inesatti',
            'cancellazione ("diritto all\'oblio")',
            'portabilità dei dati in formato leggibile (puoi già esportare la scheda di ogni animale in PDF dall\'app)',
            'opposizione o limitazione del trattamento',
          ]}
        />
        <p>
          Per esercitare questi diritti scrivi a{' '}
          <a href="mailto:lucaiolienrico@gmail.com" className="text-brand-600 underline">lucaiolienrico@gmail.com</a>.
          Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali
          (<a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer" className="text-brand-600 underline">garanteprivacy.it</a>).
        </p>
      </LegalSection>

      <LegalSection heading="7. Cookie">
        <p>
          PetNote usa esclusivamente cookie/storage tecnici necessari al funzionamento
          (sessione di autenticazione). Non usiamo cookie di profilazione, analytics
          o pubblicitari di terze parti.
        </p>
      </LegalSection>

      <LegalSection heading="8. Minori">
        <p>PetNote non è rivolto a persone minori di 18 anni.</p>
      </LegalSection>

      <LegalSection heading="9. Modifiche a questa informativa">
        <p>
          Possiamo aggiornare periodicamente questa informativa. In caso di modifiche
          sostanziali te ne daremo comunicazione tramite l'app o via email.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
