-- Phase 1: Cost tracking columns + config table

alter table usage_snapshots
  add column if not exists cost_usd numeric,
  add column if not exists cost_per_unit numeric;

create table if not exists cost_alert_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  integration_id uuid not null references integrations(id) on delete cascade,
  metric_name text not null,
  drift_percent numeric not null default 10 check (drift_percent between 1 and 50),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (integration_id, metric_name)
);

alter table cost_alert_configs enable row level security;

create policy "own cost configs" on cost_alert_configs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table alert_history
  add column if not exists cost_context jsonb;

alter table alert_history
  drop constraint if exists alert_history_alert_kind_check;

alter table alert_history
  add constraint alert_history_alert_kind_check
  check (alert_kind in ('threshold', 'spike', 'cost_drift'));
