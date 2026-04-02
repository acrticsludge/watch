-- Per-metric spike alert on/off configuration
CREATE TABLE spike_configs (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  metric_name    text NOT NULL,
  enabled        boolean NOT NULL DEFAULT true,
  UNIQUE (integration_id, metric_name)
);

CREATE INDEX spike_configs_user_id_idx ON spike_configs (user_id);

ALTER TABLE spike_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own spike configs"
  ON spike_configs FOR ALL USING (auth.uid() = user_id);

-- Distinguish threshold alerts from spike alerts in history
ALTER TABLE alert_history
  ADD COLUMN alert_kind text NOT NULL DEFAULT 'threshold'
  CHECK (alert_kind IN ('threshold', 'spike'));
