# Stackwatch

> Know before your users do.

Stackwatch monitors usage across your developer tools — GitHub Actions, Vercel, Supabase, and Railway — and alerts you before you hit a limit. No more finding out you've exceeded a quota when something breaks in production.

---

## Features

- **Connect once, monitor always** — add API keys for each service and Stackwatch polls them automatically
- **Threshold alerts** — set a % threshold per metric and get notified via Email, Slack, Discord, or Browser Push
- **Usage history** — track trends over time with line graphs (Pro)
- **Per-project breakdowns** — see which repo, project, or bucket is driving usage (Pro)
- **Team dashboard** — shared view of pooled usage across all team members (Team)

## Supported Services

| Service | Metrics tracked |
|---|---|
| GitHub Actions | Actions minutes, packages bandwidth, storage, per-repo breakdown |
| Vercel | Bandwidth, build minutes, function invocations, deployments, per-project breakdown |
| Supabase | DB size, MAU, storage buckets, connections, realtime, edge functions |
| Railway | Memory, CPU, network, disk, per-project breakdown |

## Stack

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS + Radix UI
- **Auth + DB:** Supabase (Auth + Postgres + RLS)
- **Worker:** Node.js on Railway (polls every 15 min on Free, 5 min on Pro)
- **Payments:** Dodo Payments
- **Email:** Resend
- **Hosting:** Vercel

## Project Structure

```
/frontend        Next.js app (dashboard, landing, API routes)
/worker          Polling worker (runs on Railway)
```

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- A Dodo Payments account (for billing)
- A Resend account (for email alerts)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

### Worker

```bash
cd worker
npm install
cp .env.example .env         # fill in your keys
npm run dev
```

### Environment Variables

**frontend/.env.local**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ENCRYPTION_KEY=                    # 32-byte hex string for encrypting API keys
RESEND_API_KEY=
DODO_API_KEY=
DODO_WEBHOOK_KEY=
DODO_PRO_PRODUCT_ID=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=      # for browser push notifications
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=
```

**worker/.env**

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ENCRYPTION_KEY=                    # must match frontend
RESEND_API_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=
```

## Pricing

| Plan | Price | Integrations | Polling | History |
|---|---|---|---|---|
| Free | $0/mo | 1 per service | 15 min | 7 days |
| Pro | $10/mo | 5 per service | 5 min | 30 days |
| Team | $30/mo | Unlimited | 1 min | 90 days |

## Wiki

Full documentation for connecting each service is in the [Wiki](../../wiki):

- [Connecting GitHub Actions](../../wiki/Connecting-GitHub-Actions)
- [Connecting Vercel](../../wiki/Connecting-Vercel)
- [Connecting Supabase](../../wiki/Connecting-Supabase)
- [Connecting Railway](../../wiki/Connecting-Railway)
