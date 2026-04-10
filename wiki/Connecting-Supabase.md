# Connecting Supabase

Stackwatch tracks your Supabase database size, monthly active users, storage buckets, and more. On Pro, it also monitors connections, cache hit ratio, realtime usage, edge function invocations, database egress, and gives you a per-table storage breakdown.

---

## What You Need

Two things:

1. A **Supabase Management API key** — scoped to your account
2. Your **Project Reference ID** — the unique ID for the specific project you want to monitor

---

## Step 1 — Get Your Management API Key

1. Go to [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Click **Generate new token**
3. Give it a name, e.g. `stackwatch`
4. Copy the token — it's only shown once

> This is your **account-level** Management API key, not a project `anon` or `service_role` key. It lives under Account Settings, not inside a project.

---

## Step 2 — Get Your Project Reference ID

1. Open your project in the [Supabase dashboard](https://supabase.com/dashboard)
2. Go to **Project Settings → General**
3. Copy the **Reference ID** — it looks like `abcdefghijklmnop` (a 20-character alphanumeric string)

You can also find it in your project URL: `https://supabase.com/dashboard/project/<your-ref-here>`

---

## Step 3 — Add the Integration in Stackwatch

1. Navigate to your project in the Stackwatch dashboard
2. Go to the project's **Integrations** tab
3. Find **Supabase** and click **Add account**
4. Paste your **Management API key** into the API Key field
5. Paste your **Project Reference ID** into the Project Ref field
6. Give the integration a label (e.g. `my-app-prod`)
7. Click **Connect**

---

## What Gets Tracked

### Free tier

| Metric | Description |
|---|---|
| Database size | Total size of your PostgreSQL database vs 500 MB free limit |
| Monthly active users | Users who signed in this calendar month vs 50,000 MAU limit |
| Storage | Total storage used across all buckets vs 1 GB free limit |
| Per-bucket storage | Storage used per individual storage bucket |

### Pro tier (additional)

| Metric | Description |
|---|---|
| Active DB connections | Current open connections vs 60 connection limit |
| Cache hit ratio | PostgreSQL buffer cache hit ratio (higher is better; shown as % of 100) |
| Per-table storage | Size of each table in your `public` schema |
| Realtime messages | Messages sent via Realtime this month vs 2,000,000 limit |
| Realtime peak connections | Peak concurrent Realtime connections vs limit |
| Edge function invocations | Edge function calls this month vs 500,000 limit |
| Database egress | Data egressed from the database vs limit (MB) |

> **Per-table storage** only includes tables in your `public` schema. Supabase's internal `auth`, `storage`, and `realtime` schemas are intentionally excluded.

---

## Troubleshooting

### "Invalid or expired Management API token"
The token has been revoked or is incorrect. Regenerate a new one at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) and reconnect.

### "Token lacks permission to query the database"
The Management API key doesn't have permission to execute queries against this project. Ensure you're using an account-level Management API key, not a project `anon` key or `service_role` key.

### "Project not found or database query endpoint unavailable"
The Project Reference ID is wrong, or the project has been paused/deleted. Double-check the ref under **Project Settings → General**. Note that free-tier Supabase projects pause after a period of inactivity — you'll need to unpause the project in the Supabase dashboard first.

### "Supabase integration missing project_ref"
The integration was saved without a Project Reference ID. Delete the integration and re-add it with the correct ref.

### I see auth tables in my database size breakdown
This shouldn't happen — Stackwatch filters to the `public` schema only. If you're seeing `auth.*` entries, your integration may have been connected before a recent fix. Reconnect the integration to clear the old data.

### Storage shows 0
If you have no storage buckets, storage will show as 0. The metric only appears if at least one bucket exists.

---

## Token Rotation

Supabase Management API tokens don't expire automatically, but you should rotate them periodically.

1. Generate a new token at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. In Stackwatch, go to the project's **Integrations** tab, find your Supabase integration, and click the **edit (pencil)** icon
3. Paste the new token and save

You do **not** need to change the Project Ref unless you're switching projects.
