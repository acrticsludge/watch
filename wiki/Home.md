# Stackwatch Wiki

Welcome to the Stackwatch documentation. Stackwatch monitors usage across your developer tools and alerts you before you hit limits.

## How Stackwatch Is Organized

Stackwatch uses a two-level hierarchy:

- **Organizations** — a top-level grouping (e.g. a company, team, or personal workspace)
- **Projects** — individual projects within an organization (e.g. `prod`, `staging`, `side-project`)

Each project has its own set of **Integrations**, **Alerts**, and **Settings**. Integrations are connected at the project level — each project independently tracks usage for whichever services you connect to it.

**Navigation:**
1. The **Dashboard** shows all your organizations and their projects.
2. Click into a project to reach that project's **Dashboard**, **Integrations**, **Alerts**, and **Settings** tabs.
3. Add or manage integrations from a project's **Integrations** tab.

On the **Free plan**, you can have one primary organization and one primary project per organization. Additional organizations or projects are paused until you upgrade or make one primary. Paused orgs/projects can be deleted from the main dashboard.

---

## Connecting Services

Each service requires an API key or token. Keys are encrypted before being stored — Stackwatch never logs or exposes them in plain text.

Connect a service from a project's **Integrations** tab → **Add account**.

| Service | What you need | Guide |
|---|---|---|
| GitHub Actions | Personal Access Token | [Connecting GitHub Actions](Connecting-GitHub-Actions) |
| Vercel | API Token | [Connecting Vercel](Connecting-Vercel) |
| Supabase | Management API Key + Project Ref | [Connecting Supabase](Connecting-Supabase) |
| Railway | API Token | [Connecting Railway](Connecting-Railway) |
| MongoDB Atlas | Atlas Public Key + Private Key + Project ID | [Connecting MongoDB Atlas](Connecting-MongoDB-Atlas) |

On the **Free plan**, each project supports one account per service. Upgrade to Pro to connect multiple accounts per service.

---

## Tracked Metrics by Tier

### Free
- Aggregate usage per service (Actions minutes, bandwidth, DB size, etc.)
- Per-project / per-bucket breakdowns where applicable (Railway per-project, Supabase per-bucket)
- Email alerts only
- 15-minute polling
- 7-day history

### Pro
- Everything in Free
- Deeper per-entity breakdowns (per-repo, per-table, per-project network/disk)
- All alert channels (Email, Slack, Discord, Browser Push)
- 5-minute polling
- 30-day history + usage graphs
- Spike detection alerts — notified when a metric spikes unusually above its recent baseline

---

## Status Indicators

| Color | Meaning |
|---|---|
| Green | Under 60% of limit |
| Yellow | 60–80% of limit |
| Red | Over 80% of limit |

---

## Polling

The worker polls all connected integrations every 15 minutes (Free) or 5 minutes (Pro). The **Last synced** timestamp on each integration card shows when data was last fetched. If an integration is in an error state, the worker will keep retrying on the next cycle without affecting your other integrations.
