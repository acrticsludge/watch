# Stackwatch Wiki

Welcome to the Stackwatch documentation. Stackwatch monitors usage across your developer tools and alerts you before you hit limits.

## Connecting Services

Each service requires an API key or token. Keys are encrypted before being stored — Stackwatch never logs or exposes them in plain text.

| Service | What you need | Guide |
|---|---|---|
| GitHub Actions | Personal Access Token | [Connecting GitHub Actions](Connecting-GitHub-Actions) |
| Vercel | API Token | [Connecting Vercel](Connecting-Vercel) |
| Supabase | Management API Key + Project Ref | [Connecting Supabase](Connecting-Supabase) |
| Railway | API Token | [Connecting-Railway](Connecting-Railway) |

## Tracked Metrics by Tier

### Free
- Aggregate usage per service (Actions minutes, bandwidth, DB size, etc.)
- Email alerts only
- 15-minute polling
- 7-day history

### Pro
- Everything in Free
- Per-project / per-repo / per-bucket breakdowns
- All alert channels (Email, Slack, Discord, Browser Push)
- 5-minute polling
- 30-day history + usage graphs

## Status Indicators

| Color | Meaning |
|---|---|
| Green | Under 60% of limit |
| Yellow | 60–80% of limit |
| Red | Over 80% of limit |

## Polling

The worker polls all connected integrations every 15 minutes (Free) or 5 minutes (Pro). The **Last synced** timestamp on each card shows when data was last fetched. If an integration is in an error state, the worker will keep retrying on the next cycle without affecting your other integrations.
