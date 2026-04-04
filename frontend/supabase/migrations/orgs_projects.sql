-- Migration: Organization & Project Hierarchy
-- Idempotent — safe to run multiple times.

-- ============================================================
-- organizations
-- ============================================================
create table if not exists organizations (
  id         uuid primary key default uuid_generate_v4(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 80),
  slug       text not null check (slug ~ '^[a-z0-9-]{1,40}$'),
  created_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create index if not exists organizations_owner_id_idx on organizations(owner_id);
create index if not exists organizations_created_at_idx on organizations(owner_id, created_at asc);

-- ============================================================
-- projects
-- ============================================================
create table if not exists projects (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references organizations(id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 80),
  slug       text not null check (slug ~ '^[a-z0-9-]{1,40}$'),
  created_at timestamptz not null default now(),
  unique (org_id, slug)
);

create index if not exists projects_org_id_idx on projects(org_id);
create index if not exists projects_created_at_idx on projects(org_id, created_at asc);

-- ============================================================
-- Add project_id to integrations
-- ============================================================
alter table integrations
  add column if not exists project_id uuid references projects(id) on delete set null;

create index if not exists integrations_project_id_idx on integrations(project_id);

-- ============================================================
-- RLS Policies
-- ============================================================

alter table organizations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'organizations' and policyname = 'organizations: owner can manage'
  ) then
    create policy "organizations: owner can manage" on organizations
      for all
      using (auth.uid() = owner_id)
      with check (auth.uid() = owner_id);
  end if;
end $$;

alter table projects enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'projects' and policyname = 'projects: org owner can manage'
  ) then
    create policy "projects: org owner can manage" on projects
      for all
      using (
        exists (
          select 1 from organizations
          where id = projects.org_id and owner_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from organizations
          where id = projects.org_id and owner_id = auth.uid()
        )
      );
  end if;
end $$;

-- ============================================================
-- Backfill: one default org + project per existing user
-- ============================================================

-- 1. Create a default org for every user who has at least one integration
insert into organizations (owner_id, name, slug)
  select distinct user_id, 'My Organization', 'my-organization'
  from integrations
  on conflict (owner_id, slug) do nothing;

-- 2. Create a default project for each of those orgs
insert into projects (org_id, name, slug)
  select id, 'Default Project', 'default-project'
  from organizations
  where name = 'My Organization'
  on conflict (org_id, slug) do nothing;

-- 3. Assign existing integrations to their user's default project
update integrations i
set project_id = p.id
from organizations o
join projects p on p.org_id = o.id
where o.owner_id = i.user_id
  and o.name = 'My Organization'
  and p.name = 'Default Project'
  and i.project_id is null;
