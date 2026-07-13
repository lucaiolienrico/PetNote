// Header CORS condivisi per le Edge Function chiamate dal browser
// (create/cancel subscription). paypal-webhook e' server-to-server e non li usa.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
