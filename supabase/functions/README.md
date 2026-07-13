# Edge Functions — sorgente versionato

Questa cartella è lo **specchio versionato** del codice attualmente live su
Supabase (project `sspezhjfgkskdbojngjs`), sincronizzato manualmente il
2026-07-13. Prima di questa modifica il codice delle Edge Function esisteva
**solo** dentro Supabase — zero history, zero diff, zero rollback possibile
via git.

## ⚠️ La fonte di verità resta Supabase, non questa cartella

Non esiste un CLI/terminale locale in questo workflow (Enrico lavora
interamente browser-based) e non c'è una pipeline CI di deploy automatico.
Il deploy avviene **sempre** manualmente via `Supabase:deploy_edge_function`
(Claude) o Dashboard Supabase (Enrico). Questa cartella è quindi:

- ✅ Storico/diff delle modifiche nel tempo (`git log`, `git blame`, PR review)
- ✅ Riferimento per rigenerare una function da zero in caso di problemi
- ❌ **NON** deployata automaticamente al push — un push su questo repo
  **non** aggiorna Supabase da solo

**Regola operativa:** ogni volta che una Edge Function viene modificata e
deployata (via MCP o Dashboard), il file corrispondente qui va aggiornato
**nello stesso commit/sessione** — altrimenti questa cartella droppa di
nuovo dal vero stato live (stesso tipo di drift già visto su SKILL.md).

## Elenco function versionate — verify_jwt critico

`verify_jwt` **non è nel codice sorgente** — è un flag impostato al momento
del deploy (parametro separato, non dentro `index.ts`). Sbagliarlo in un
redeploy manuale rompe la funzione silenziosamente (es. `paypal-webhook` con
`verify_jwt=true` rifiuterebbe ogni chiamata PayPal, perché PayPal non manda
un JWT Supabase). Tabella di riferimento obbligatoria prima di ogni redeploy:

| Function | `verify_jwt` | Perché |
|---|---|---|
| `create-paypal-subscription` | `true` | Richiede sessione utente Supabase |
| `paypal-webhook` | **`false`** | Chiamante = PayPal, auth reale è `verifyWebhookSignature()` interna |
| `cancel-paypal-subscription` | `true` | Richiede sessione utente Supabase |
| `admin-metrics` | `true` | Richiede sessione utente + check `is_admin` applicativo interno |
| `send-reminders` | **`false`** | Chiamante = pg_cron/pg_net, auth reale è header `x-cron-secret` |
| `get-shared-pet-data` | **`false`** | Endpoint pubblico anonimo, auth reale è il token in `share_links` |

## Escluse deliberatamente da questa cartella

Tre endpoint di debug one-shot (fix PayPal del 2026-07-13), già disattivati
con stub `410 Gone` incondizionato — non versionati perché morti e in attesa
di eliminazione da Dashboard (nessun tool MCP di delete disponibile):

- `paypal-diagnostics`
- `paypal-fix-annual-price`
- `paypal-fix-webhook-events`

Se in futuro vengono eliminati da Dashboard, nessuna azione richiesta qui —
non sono mai stati versionati.

## Struttura per function

Ogni cartella contiene i file esattamente come deployati (stesso set passato
a `files` in `deploy_edge_function`):

- `index.ts` — entrypoint
- `cors.ts` — quando la function è chiamata dal browser (non presente in
  `paypal-webhook` e `send-reminders`, che non hanno chiamante browser)
- `paypal-helpers.ts` — client OAuth PayPal minimale, **duplicato
  identico in ogni function che lo usa** (le Edge Function non
  condividono moduli tra deploy diversi — ogni funzione è isolata)
