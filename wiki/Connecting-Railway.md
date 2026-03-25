# Connecting Railway

Stackwatch tracks memory and CPU usage across all your Railway projects and services, with per-project breakdowns and network/disk metrics on Pro.

---

## What You Need

A **Railway API Token** from your Railway account settings.

---

## Step 1 — Create a Railway API Token

1. Go to [railway.com/account/tokens](https://railway.com/account/tokens)
2. Click **Create Token**
3. Give it a name, e.g. `stackwatch`
4. Copy the token

> Railway tokens are account-scoped and give read access to all projects in your account.

---

## Step 2 — Add the Integration in Stackwatch

1. Go to **Integrations** in the Stackwatch dashboard
2. Click **Add integration → Railway**
3. Paste your token into the **API Token** field
4. Give the integration a label (e.g. `railway-prod`)
5. Click **Connect**

Stackwatch will automatically discover all projects and services in your Railway account — no project IDs needed.

---

## What Gets Tracked

Usage is measured from the start of the current calendar month to now.

### Free tier

| Metric | Description |
|---|---|
| Memory usage | Average memory used across all services (MB) vs 512 MB per-service limit |
| CPU usage | Average CPU usage across all services (%) vs 100% per-service limit |
| Per-project memory | Memory broken down per Railway project |
| Per-project CPU | CPU broken down per Railway project |

> Limits scale with service count. If you have 3 services, the memory limit shown is 1,536 MB (3 × 512 MB).

### Pro tier (additional)

| Metric | Description |
|---|---|
| Peak CPU | Highest CPU spike recorded this month |
| Peak memory | Highest memory spike recorded this month |
| Network outbound | Total data sent from your services (MB) vs 100 GB limit |
| Network inbound | Total data received by your services (MB) vs 100 GB limit |
| Disk usage | Disk used across all services (MB) vs 1 GB per-service limit |
| Per-project peak CPU | Peak CPU per project |
| Per-project peak memory | Peak memory per project |
| Per-project network | Network in/out per project |
| Per-project disk | Disk usage per project |

---

## How Usage Is Calculated

Railway's API returns cumulative sums of CPU and memory readings over the selected time period. Stackwatch divides these by the number of minutes elapsed since the start of the month to produce an **average instantaneous reading**. This means:

- Shortly after a billing period starts (e.g. the 1st of the month), values may appear lower than expected because there are fewer minutes of data to average over
- Values stabilize as the month progresses
- Peak values (Pro) are tracked separately and represent the highest single reading, not an average

---

## Troubleshooting

### "Invalid or expired API token"
The token was revoked or is incorrect. Generate a new token at [railway.com/account/tokens](https://railway.com/account/tokens) and reconnect.

### No data / all zeros
If all your Railway services are idle (sleeping or no traffic), the usage API may return zero values. This is expected — Stackwatch will still show the integration as connected and display 0 usage. Values will update once your services are active.

### Missing projects
Stackwatch queries all projects accessible to the token. If a project is missing, check that the Railway account connected is the owner (not just a collaborator) of that project, as collaborator access may vary.

### Usage looks unexpectedly high
CPU and memory values shown are averages across the billing period, not current live values. A spike earlier in the month will be reflected in the average. Use the **Peak CPU** and **Peak memory** metrics (Pro) to identify spikes.

---

## Token Rotation

1. Create a new token at [railway.com/account/tokens](https://railway.com/account/tokens)
2. In Stackwatch, go to **Integrations**, find your Railway integration, and click **Edit**
3. Paste the new token and save
