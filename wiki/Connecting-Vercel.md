# Connecting Vercel

Stackwatch tracks your Vercel bandwidth, build minutes, and function invocations against your plan's limits, with per-project deployment breakdowns on Pro.

---

## Requirements

- A Vercel account on the **Pro or Team plan**. The Vercel billing API is not available on Hobby accounts — if you connect a Hobby account, the integration will show an "unsupported" status.
- A **Vercel API Token** with access to your account's billing data.

---

## Step 1 — Create a Vercel API Token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create**
3. Give it a name, e.g. `stackwatch`
4. Set the scope to **Full Account** (required to read billing/usage data)
5. Set an expiry (no expiry is fine for long-term monitoring, but rotation is good practice)
6. Click **Create Token** and copy it — it's only shown once

---

## Step 2 — Add the Integration in Stackwatch

1. Navigate to your project in the Stackwatch dashboard
2. Go to the project's **Integrations** tab
3. Find **Vercel** and click **Add account**
4. Paste your token into the **API Token** field
5. Give the integration a label (e.g. `vercel-prod`)
6. Click **Connect**

---

## What Gets Tracked

### Free tier

| Metric | Description |
|---|---|
| Bandwidth | Data transferred vs your plan's monthly bandwidth limit (GB) |
| Build minutes | Total build execution time vs monthly limit |
| Function invocations | Serverless function executions vs monthly limit |

### Pro tier (additional)

| Metric | Description |
|---|---|
| Edge function execution | Edge function execution time (ms) vs limit |
| Image optimizations | Optimized images served vs monthly limit |
| Analytics events | Analytics events recorded vs limit |
| Deployments | Total deployments this month vs account limit |
| Per-project deployments | Deployment count broken down per project for the current month |

---

## Troubleshooting

### "Invalid or expired API token"
The token was revoked or expired. Generate a new one and reconnect from the project's **Integrations** tab.

### "Token lacks billing read permissions"
The token scope doesn't cover billing data. Make sure you selected **Full Account** scope when creating it. Team-scoped tokens for a specific team may not have access to account-level billing.

### "Hobby plan accounts are not supported"
The Vercel billing/usage API is only available on Pro and Team plans. Vercel does not expose usage data for Hobby accounts via their API. You'll need to upgrade your Vercel plan to use this integration.

### Metrics show 0 or aren't updating
Vercel's usage API updates periodically, not in real time. If you've just started a billing period or had very little activity, values may be 0. Check back after your next Stackwatch poll cycle.

---

## Token Rotation

1. Create a new token at [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. In Stackwatch, go to the project's **Integrations** tab, find your Vercel integration, and click the **edit (pencil)** icon
3. Paste the new token and save
