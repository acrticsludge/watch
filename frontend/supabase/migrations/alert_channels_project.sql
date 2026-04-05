-- Migration: Per-project alert channels
-- Adds project_id to alert_channels so each project can have independent
-- notification methods (Slack webhook, email, Discord, etc.).
-- Existing channels (project_id = NULL) remain as user-level fallback channels.

ALTER TABLE alert_channels
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS alert_channels_project_id_idx ON alert_channels(project_id);

-- Update RLS: workers use service role, so no RLS change needed.
-- Existing "alert_channels: users own their rows" policy uses auth.uid() = user_id
-- which continues to work correctly regardless of project_id value.
