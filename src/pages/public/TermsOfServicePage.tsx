import { Link } from 'react-router-dom'
import { LegalPageLayout, LegalSection } from '@/components/shared/LegalPageLayout'

/**
 * BOZZA tecnica — struttura standard ToS per SaaS B2C italiano con
 * abbonamento ricorrente. NON consulenza legale. In particolare la clausola
 * sul diritto di recesso (art. 52-59 Codice del Consumo) e il foro competente
 * vanno confermati da un legale prima del lancio — qui riflettono la regola
 * generale (foro del consumatore inderogabile), non una scelta specifica.
 */
export function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Termini di servizio" lastUpdated="13 luglio 2026">
      <LegalSection heading="1. Il servizio">
        <p>
          PetNote è un'applicazione web per tenere traccia dei dati sanitari e amministrativi
          dei tuoi animali domestici (vaccinazioni, visite veterinarie, antiparassitari, farmaci,
          peso, allergie, assicurazioni, documenti, promemoria). Registrandoti accetti questi
          termini e la nostra <Link to="/privacy" className="text-brand-600 underline">informativa sulla privacy</Link>.
        </p>
      </LegalSection>

      <LegalSection heading="2. Non è un parere veterinario">
        <p>
          PetNote è uno strumento di organizzazione e promemoria. Non fornisce diagnosi,
          consulenza o cure veterinarie e non sostituisce il giudizio di un veterinario
          professionista. Per qualsiasi decisione sulla salute del tuo animale, rivolgiti
          sempre a un veterinario.
        </p>
      </LegalSection>

      <LegalSection heading="3. Account">
        <p>
          Per usare PetNote devi avere almeno 18 anni e fornire informazioni accurate in fase
          di registrazione. Sei responsabile della riservatezza delle tue credenziali di accesso
          e di ogni attività svolta dal tuo account.
        </p>
      </LegalSection>

      <LegalSection heading="4. Piano Free e Premium">
        <p>
          PetNote offre un piano gratuito con funzionalità limitate (un animale, un numero
          limitato di visite e allergie per animale) e un piano Premium a pagamento che sblocca
          tutte le funzionalità senza limiti. I prezzi correnti dei piani Premium sono sempre
          indicati in app al momento dell'acquisto.
        </p>
      </LegalSection>

      <LegalSection heading="5. Pagamento e rinnovo automatico">
        <p>
          Gli abbonamenti Premium sono elaborati da PayPal e si rinnovano automaticamente
          (mensilmente o annualmente, a seconda del piano scelto) fino a disdetta. Puoi
          annullare il rinnovo in qualsiasi momento dalle impostazioni dell'account
          (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">/app/settings</code>): l'accesso
          Premium resta attivo fino alla fine del periodo già pagato, senza rimborso della
          parte residua salvo diversa previsione di legge.
        </p>
      </LegalSection>

      <LegalSection heading="6. Diritto di recesso">
        <p>
          Se sei un consumatore residente nell'Unione Europea, hai diritto di recedere dal
          contratto entro 14 giorni dalla sottoscrizione senza dover fornire motivazione,
          salvo che tu abbia richiesto espressamente l'attivazione immediata del servizio
          digitale — nel qual caso, attivando l'abbonamento Premium, accetti che il servizio
          inizi immediatamente e prendi atto che ciò può comportare la perdita del diritto di
          recesso una volta che il servizio è stato pienamente eseguito, ai sensi degli artt.
          52-59 del Codice del Consumo.
        </p>
      </LegalSection>

      <LegalSection heading="7. Proprietà dei dati">
        <p>
          I dati che inserisci sui tuoi animali restano tuoi. Puoi esportarli in PDF in
          qualsiasi momento dall'app. Se chiudi il tuo account, i dati vengono cancellati
          secondo quanto descritto nell'informativa sulla privacy.
        </p>
      </LegalSection>

      <LegalSection heading="8. Disponibilità del servizio">
        <p>
          Ci impegniamo a mantenere PetNote disponibile e funzionante, ma non garantiamo
          un'assenza totale di interruzioni, errori o tempi di inattività, inclusi quelli
          dovuti a manutenzione o a servizi di terze parti (hosting, database, pagamenti)
          da cui il servizio dipende.
        </p>
      </LegalSection>

      <LegalSection heading="9. Limitazione di responsabilità">
        <p>
          Nei limiti consentiti dalla legge, PetNote non è responsabile per danni indiretti
          derivanti dall'uso o dall'impossibilità di usare il servizio, incluse decisioni
          prese sulla base delle informazioni inserite nell'app.
        </p>
      </LegalSection>

      <LegalSection heading="10. Chiusura dell'account">
        <p>
          Puoi chiudere il tuo account in qualsiasi momento scrivendo a{' '}
          <a href="mailto:lucaiolienrico@gmail.com" className="text-brand-600 underline">lucaiolienrico@gmail.com</a>.
          Ci riserviamo il diritto di sospendere account che violano questi termini o ne
          facciano un uso fraudolento o abusivo.
        </p>
      </LegalSection>

      <LegalSection heading="11. Modifiche ai termini">
        <p>
          Possiamo aggiornare questi termini nel tempo. In caso di modifiche sostanziali te ne
          daremo comunicazione tramite l'app o via email prima che diventino efficaci.
        </p>
      </LegalSection>

      <LegalSection heading="12. Legge applicabile e foro competente">
        <p>
          Questi termini sono regolati dalla legge italiana. Per i consumatori, è competente
          in via esclusiva il foro del luogo di residenza o domicilio del consumatore, ai
          sensi dell'art. 33, comma 2, lett. u) del Codice del Consumo.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contatti">
        <p>
          Per qualsiasi domanda su questi termini scrivi a{' '}
          <a href="mailto:lucaiolienrico@gmail.com" className="text-brand-600 underline">lucaiolienrico@gmail.com</a>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
