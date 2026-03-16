-- Stackwatch Row Level Security Policies
-- Run AFTER schema.sql

-- ============================================================
-- integrations
-- ============================================================
alter table integrations enable row level security;

create policy "integrations: users own their rows"
  on integrations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- usage_snapshots
-- ============================================================
alter table usage_snapshots enable row level security;

create policy "usage_snapshots: users see their integrations' data"
  on usage_snapshots for select
  using (
    exists (
      select 1 from integrations
      where integrations.id = usage_snapshots.integration_id
        and integrations.user_id = auth.uid()
    )
  );

-- Worker uses service role (bypasses RLS) for inserts
create policy "usage_snapshots: service role can insert"
  on usage_snapshots for insert
  with check (true);

-- ============================================================
-- alert_configs
-- ============================================================
alter table alert_configs enable row level security;

create policy "alert_configs: users own their rows"
  on alert_configs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- alert_channels
-- ============================================================
alter table alert_channels enable row level security;

create policy "alert_channels: users own their rows"
  on alert_channels for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- alert_history
-- ============================================================
alter table alert_history enable row level security;

create policy "alert_history: users see their own history"
  on alert_history for select
  using (auth.uid() = user_id);

-- Worker inserts via service role (bypasses RLS)
create policy "alert_history: service role can insert"
  on alert_history for insert
  with check (true);
