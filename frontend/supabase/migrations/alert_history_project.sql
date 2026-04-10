-- Migration: Add project_id to alert_history
-- This decouples alert history from the integration FK for cascade safety,
-- and allows direct project-scoped queries without a 2-step integration lookup.

ALTER TABLE alert_history
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS alert_history_project_id_idx ON alert_history(project_id);

-- Backfill: set project_id from the linked integration's project_id
UPDATE alert_history ah
SET project_id = i.project_id
FROM integrations i
WHERE i.id = ah.integration_id
  AND i.project_id IS NOT NULL
  AND ah.project_id IS NULL;
