// Header CORS condivisi — stesso pattern di create/cancel-paypal-subscription
// e admin-metrics. Chiamata da pagina pubblica anonima: nessun Authorization
// richiesto, ma apikey resta necessario per attraversare il gateway Kong.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
