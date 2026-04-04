# Stackwatch — claude.md

## Project Overview

Stackwatch is a usage monitoring SaaS for small dev teams. It connects to GitHub Actions, Vercel, and Supabase via API keys, polls usage data on a schedule, and alerts users when they're approaching limits or thresholds they define.

## Stack

- **Framework:** Next.js (App Router)
- **Database + Auth:** Supabase (Supabase Auth for authentication)
- **Backend jobs:** Railway (polling worker)
- **Hosting:** Vercel
- **Language:** TypeScript throughout

## Core Features

### 1. Authentication

- Supabase Auth with four methods: email/password, magic link, GitHub OAuth, and Google OAuth
- OAuth providers (GitHub + Google) must be enabled in the Supabase dashboard with their client IDs and secrets
- After any OAuth login, users are redirected to /dashboard via /auth/callback
- Each user has their own isolated data — they can only see their own integrations and alerts
- Protect all dashboard routes, redirect unauthenticated users to /login

### 2. Integrations

Users connect services by providing API keys/tokens. Store keys encrypted in Supabase. Support three services in v1:

**GitHub Actions**

- Connect via GitHub Personal Access Token
- Track: Actions minutes used vs monthly limit, broken down by repo
- API: GitHub REST API — `/repos/{owner}/{repo}/actions/billing/usage` and `/orgs/{org}/settings/billing/actions`

**Vercel**

- Connect via Vercel API token
- Track: Bandwidth usage, build minutes, function invocations vs plan limits
- API: Vercel REST API — `/v2/billing/usage`

**Supabase**

- Connect via Supabase Management API key + project ref
- Track: Database size, row count, storage used, monthly active users vs free tier limits
- API: Supabase Management API — `/v1/projects/{ref}/usage`

Each integration has a status: connected / error / disconnected.

### 3. Usage Dashboard

- Single page showing all connected services
- Each service shows a usage card with:
  - Current usage vs limit (progress bar)
  - % used
  - Last synced timestamp
  - Status indicator (green / yellow / red based on threshold)
- Auto-refreshes every 5 minutes on the page
- Color coding: green = under 60%, yellow = 60–80%, red = over 80%

### 4. Threshold Alerts

- Users set a threshold % per metric (default 80%)
- When usage crosses the threshold an alert fires
- Alert channels: Email, Slack webhook, Discord webhook, Browser push notifications
- Each alert includes: service name, metric name, current usage, limit, % used, timestamp
- Don't re-alert on the same metric until it drops below threshold and crosses again (no spam)
- Store alert history in Supabase so users can see past alerts

### 5. Polling Worker

- Runs on Railway as a standalone Node.js worker
- Polls all connected integrations every 15 minutes
- On each poll: fetch usage, update the database, check thresholds, fire alerts if needed
- Use a simple queue pattern — loop through all users and their integrations
- Log errors per integration without crashing the whole worker

### 6. Notifications Setup

- Email: use Resend, send from alerts@pulsemonitor.dev
- Slack: user provides an incoming webhook URL
- Discord: user provides an incoming webhook URL
- Browser push: use Web Push API, store push subscriptions in Supabase

### 7. Settings Page

- Manage connected integrations (add / remove / re-authenticate)
- Set thresholds per metric
- Configure alert channels (add Slack webhook, Discord webhook, enable email, enable push)
- Account settings (email, password change)

## Database Schema (Supabase)

**users** — handled by Supabase Auth

**integrations**

- id, user_id, service (github | vercel | supabase), account_label, api_key (encrypted), status, created_at, last_synced_at

**usage_snapshots**

- id, integration_id, metric_name, current_value, limit_value, percent_used, recorded_at

**alert_configs**

- id, user_id, integration_id, metric_name, threshold_percent, enabled

**alert_channels**

- id, user_id, type (email | slack | discord | push), config (jsonb), enabled

**alert_history**

- id, user_id, integration_id, metric_name, percent_used, channel, sent_at

**teams**

- id, name, owner_id, created_at

**team_members**

- id, team_id, user_id, role (admin | member), joined_at

**team_invites**

- id, team_id, email, token, accepted, created_at

**subscriptions**

- id, user_id, tier (free | pro | team), status, created_at, updated_at

### 8. Pricing Tiers

**Free — $0/mo**

- 1 account per service (1 GitHub, 1 Vercel, 1 Supabase)
- Email alerts only
- 15 minute polling interval
- 7 days usage history

**Pro — $10/mo**

- Multiple accounts per service (e.g. 2 GitHub orgs, 2 Vercel teams)
- All alert channels: Email, Slack, Discord, Browser push
- 5 minute polling interval
- 30 days usage history
- Usage history graphs

**Team — $30/mo**

- Everything in Pro
- Invite team members via email
- Shared pooled usage dashboard — shows combined usage across all connected accounts
- Dashboard only accessible to invited team members
- Team admin can manage members (invite / remove)

Enforce tier limits in the API and worker. Show upgrade prompts when a user hits a free tier limit.

### 9. Usage History Graphs

- Available on Pro and Team tiers
- Per metric, show a line graph of usage over time (last 30 days)
- Data points come from usage_snapshots table
- Show min, max, average for the period
- Built with Recharts

### 10. Team Dashboard

- Available on Team tier only
- Shared page showing pooled usage across all team members' connected accounts
- Accessible only to invited team members — not public
- Team admin can invite members via email
- Invite flow: send email with invite link → recipient signs up or logs in → joins team
- Each member still has their own integrations but team dashboard aggregates all of them

### 11. Landing Page (`/`)

- Public page at the root, no auth required
- Sections:
  - Hero: headline, subheadline, CTA button to /signup
  - Problem: "You're juggling 5 dashboards. You find out you hit a limit when something breaks."
  - Live demo: interactive mock dashboard showing fake usage data — no signup required, just shows what the product looks like in action
  - How it works: 3 steps — connect your services, set thresholds, get alerted before it's too late
  - Supported services: GitHub Actions, Vercel, Supabase logos with "more coming soon"
  - Alert channels: Email, Slack, Discord, Browser push
  - Pricing: three tier cards — Free ($0), Pro ($10/mo), Team ($30/mo) with feature lists and CTA buttons
  - Footer: links to /login, /signup, privacy, terms
- Fast, clean, minimal design — no animations that slow it down
- Mobile responsive

## Project Structure

```
/app
  /dashboard        — main usage overview
  /integrations     — manage connected services and accounts
  /alerts           — alert history
  /settings         — thresholds, alert channels, account, billing
  /team             — team dashboard (Team tier only)
  /team/invite      — accept team invite
  /pricing          — pricing page
  /login
  /signup
  /api
    /integrations   — CRUD for integrations
    /usage          — fetch latest usage per integration
    /alerts         — alert config CRUD
    /team           — team management endpoints
    /webhooks       — push notification subscription endpoint
    /billing        — tier/subscription management
/worker
  index.ts          — polling loop
  services/
    github.ts
    vercel.ts
    supabase.ts
  alerts/
    email.ts
    slack.ts
    discord.ts
    push.ts
/lib
  supabase.ts       — supabase client
  encryption.ts     — encrypt/decrypt API keys
  tiers.ts          — tier limit checks and enforcement
```

## Key Rules for Claude

- Always use TypeScript, no plain JS
- Use App Router conventions (server components by default, client components only when needed)
- Never log raw API keys anywhere
- Encrypt all integration API keys before storing in the database
- Row Level Security (RLS) must be enabled on all tables — users can only access their own rows
- Handle API errors gracefully per integration — one failing integration should not block others
- Keep the worker stateless — all state lives in Supabase
- Use Resend for all outbound email
- Mobile responsive UI throughout
- No unnecessary dependencies — keep the stack lean

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes � gives risk-scored analysis |
| `get_review_context` | Need source snippets for review � token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
