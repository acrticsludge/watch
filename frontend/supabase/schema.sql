-- Stackwatch Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- integrations
-- ============================================================
create table if not exists integrations (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  service         text not null check (service in ('github', 'vercel', 'supabase', 'railway', 'mongodb')),
  account_label   text not null,
  api_key         text not null,           -- AES-256-GCM encrypted blob: iv:authTag:ciphertext
  status          text not null default 'disconnected'
                    check (status in ('connected', 'error', 'disconnected')),
  created_at      timestamptz not null default now(),
  last_synced_at  timestamptz,
  meta            jsonb                    -- service-specific extras (e.g. project_ref for Supabase)
);

create index if not exists integrations_user_id_idx on integrations(user_id);
create index if not exists integrations_service_idx on integrations(service);

-- ============================================================
-- usage_snapshots
-- ============================================================
create table if not exists usage_snapshots (
  id              uuid primary key default uuid_generate_v4(),
  integration_id  uuid not null references integrations(id) on delete cascade,
  metric_name     text not null,
  current_value   numeric not null,
  limit_value     numeric not null,
  percent_used    numeric not null,
  entity_id       text,          -- null = account-level aggregate; set = per-repo/project/bucket
  entity_label    text,          -- human-readable entity name for display
  recorded_at     timestamptz not null default now()
);

create index if not exists usage_snapshots_integration_id_idx on usage_snapshots(integration_id);
create index if not exists usage_snapshots_recorded_at_idx on usage_snapshots(recorded_at desc);
create index if not exists usage_snapshots_entity_idx on usage_snapshots(integration_id, metric_name, entity_id);

-- ============================================================
-- Migration for existing databases (run if upgrading)
-- ============================================================
-- ALTER TABLE integrations DROP CONSTRAINT IF EXISTS integrations_service_check;
-- ALTER TABLE integrations ADD CONSTRAINT integrations_service_check
--   CHECK (service IN ('github', 'vercel', 'supabase', 'railway', 'mongodb'));
-- ALTER TABLE integrations DROP CONSTRAINT IF EXISTS integrations_status_check;
-- ALTER TABLE integrations ADD CONSTRAINT integrations_status_check
--   CHECK (status IN ('connected', 'error', 'disconnected', 'unsupported'));
-- ALTER TABLE usage_snapshots ADD COLUMN IF NOT EXISTS entity_id text;
-- ALTER TABLE usage_snapshots ADD COLUMN IF NOT EXISTS entity_label text;
-- CREATE INDEX IF NOT EXISTS usage_snapshots_entity_idx
--   ON usage_snapshots(integration_id, metric_name, entity_id);
-- CREATE TABLE IF NOT EXISTS subscriptions (
--   id uuid primary key default uuid_generate_v4(),
--   user_id uuid not null references auth.users(id) on delete cascade,
--   tier text not null default 'free' check (tier in ('free', 'pro', 'team')),
--   status text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
--   created_at timestamptz not null default now(),
--   updated_at timestamptz not null default now(),
--   unique (user_id)
-- );
-- CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);

-- ============================================================
-- subscriptions
-- ============================================================
create table if not exists subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tier        text not null default 'free' check (tier in ('free', 'pro', 'team')),
  status      text not null default 'active' check (status in ('active', 'trialing', 'canceled', 'past_due')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id)
);

create index if not exists subscriptions_user_id_idx on subscriptions(user_id);

-- ============================================================
-- alert_configs
-- ============================================================
create table if not exists alert_configs (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  integration_id    uuid not null references integrations(id) on delete cascade,
  metric_name       text not null,
  threshold_percent numeric not null default 80 check (threshold_percent between 1 and 100),
  enabled           boolean not null default true,
  unique (integration_id, metric_name)
);

create index if not exists alert_configs_user_id_idx on alert_configs(user_id);

-- ============================================================
-- alert_channels
-- ============================================================
create table if not exists alert_channels (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('email', 'slack', 'discord', 'push')),
  config      jsonb not null default '{}',
  enabled     boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists alert_channels_user_id_idx on alert_channels(user_id);

-- ============================================================
-- alert_history
-- ============================================================
create table if not exists alert_history (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  integration_id  uuid not null references integrations(id) on delete cascade,
  metric_name     text not null,
  percent_used    numeric not null,
  channel         text not null check (channel in ('email', 'slack', 'discord', 'push')),
  sent_at         timestamptz not null default now()
);

create index if not exists alert_history_user_id_idx on alert_history(user_id);
create index if not exists alert_history_sent_at_idx on alert_history(sent_at desc);
