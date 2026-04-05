-- Add sort_order to organizations and projects (same pattern as integrations)
-- sort_order = 0 means primary; sort_order > 0 means secondary (locked when over tier limit)
-- Existing rows default to 0, making them primary automatically.

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;
ALTER TABLE projects      ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;
