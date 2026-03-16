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
  service         text not null check (service in ('github', 'vercel', 'supabase')),
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
  recorded_at     timestamptz not null default now()
);

create index if not exists usage_snapshots_integration_id_idx on usage_snapshots(integration_id);
create index if not exists usage_snapshots_recorded_at_idx on usage_snapshots(recorded_at desc);

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
