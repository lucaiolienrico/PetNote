-- PUSH_SUBSCRIPTIONS
-- Una riga per ogni device/browser subscription. Un utente puo' avere piu'
-- righe (piu' device). RLS ownership diretta (non transitiva: non dipende
-- da pets).
CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_user_endpoint_unique UNIQUE (user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_own" ON push_subscriptions
  FOR ALL USING (user_id = (SELECT auth.uid()));

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
