-- Add sort_order to organizations and projects (same pattern as integrations)
-- sort_order = 0 means primary; sort_order > 0 means secondary (locked when over tier limit)

-- Step 1: Add columns (existing rows temporarily get 0 via the default)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;
ALTER TABLE projects      ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;

-- Step 2: Backfill organizations
-- Rank each user's orgs by created_at asc → earliest = 0 (primary), rest get 1, 2, ...
UPDATE organizations o
SET sort_order = sub.rn
FROM (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY owner_id ORDER BY created_at ASC) - 1 AS rn
  FROM organizations
) sub
WHERE o.id = sub.id;
e
-- Step 3: Backfill projects
-- Rank each org's projects by created_at asc → earliest = 0 (primary), rest get 1, 2, ...
UPDATE projects p
SET sort_order = sub.rn
FROM (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY org_id ORDER BY created_at ASC) - 1 AS rn
  FROM projects
) sub
WHERE p.id = sub.id;
