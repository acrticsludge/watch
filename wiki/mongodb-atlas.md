# Connecting MongoDB Atlas

Stackwatch connects to MongoDB Atlas via the Atlas Admin API to track storage and connection usage across your clusters.

---

## What Stackwatch tracks

| Metric | Plan | Description |
|--------|------|-------------|
| **Storage Used** | Free + Pro | Total data size across all databases in the cluster, compared against your tier's storage limit |
| **Active Connections** | Free + Pro | Current open connection count vs the connection limit for your cluster tier |
| **Network In** (MB/h) | Pro only | Inbound network throughput (bytes/sec → MB/hour), compared against a 10 GB/day reference |
| **Network Out** (MB/h) | Pro only | Outbound network throughput, same reference |
| **Storage per cluster** | Pro only | Per-cluster storage breakdown when you have multiple clusters in the same project |

### Atlas tier limits used

| Instance | Storage | Max connections |
|----------|---------|-----------------|
| M0 (Free) | 512 MB | 500 |
| M2 | 2 GB | 300 |
| M5 | 5 GB | 500 |
| M10 | 10 GB | 1,500 |
| M20+ | from disk config | 3,000+ |

---

## Prerequisites

- A MongoDB Atlas account with at least one cluster
- Ability to create API keys in your Atlas organization (Organization Owner or Project Owner role)

---

## Step 1 — Find your Project ID

1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Select your **Organization** in the top-left dropdown
3. Click the project you want to monitor
4. Look at the URL — it contains your Project ID:
   ```
   https://cloud.mongodb.com/v2/<PROJECT_ID>#/clusters
   ```
   Copy that 24-character hex string.

---

## Step 2 — Create an API key

1. In your Atlas project, go to **Identity & Access** → **Applications** → **API Keys**
2. Click **Create API Key**
3. Enter a description (e.g. `Stackwatch monitoring`)
4. Assign the **Project Read Only** role — Stackwatch only ever reads data, it never modifies your cluster
5. Click **Next**
6. Copy both the **Public Key** (shown on screen as a short alphanumeric string) and the **Private Key** (shown only once — save it now)
7. Add your outbound IP to the access list if your Atlas project requires IP allowlisting. If you're on Vercel, you may need to allowlist `0.0.0.0/0` or use a static egress IP.

---

## Step 3 — Connect in Stackwatch

1. Go to **Integrations** in Stackwatch
2. Find **MongoDB Atlas** and click **Add account**
3. Fill in the form:
   - **Atlas Public Key** — the short key from Step 2 (e.g. `abcdefgh`)
   - **Atlas Private Key** — the long private key from Step 2 (stored encrypted)
   - **Project ID** — the 24-character ID from Step 1
   - **Account label** — a friendly name for this connection (e.g. `prod-cluster`)
4. Click **Connect**

Stackwatch will poll your cluster metrics on the next polling cycle (within 15 minutes on Free, 5 minutes on Pro).

---

## Troubleshooting

### Status shows `error` with "Invalid API key"
- Double-check that the **Public Key** and **Private Key** were copied correctly (no extra spaces)
- Verify the key pair hasn't been deleted in Atlas → Identity & Access → Applications → API Keys

### Status shows `error` with "lacks required access"
- The API key must have at least the **Project Read Only** role on the project
- Org-level roles alone are not sufficient — the key needs a project-level assignment

### Status shows `error` with "Project ID not found"
- Confirm the Project ID (24-character hex) is correct
- Make sure the API key is assigned to that specific project

### Dashboard shows no data after connecting
- Atlas takes a few minutes after cluster activity to populate monitoring data. Stackwatch will show data once the first successful sync returns measurements.
- M0 clusters with no recent activity may return empty measurement data points. Try running a query against your database to generate activity, then wait for the next poll.

### IP allowlist errors
- If your Atlas project restricts API access by IP, you need to allowlist the IP address of the Stackwatch worker (Railway egress IP). Alternatively, set the Atlas API key access list to `0.0.0.0/0` for unrestricted access (less secure).

---

## Security

- Your **Atlas Private Key** is encrypted with AES-256-GCM before being stored in the database
- Stackwatch uses the key **read-only** — it never creates, modifies, or deletes any Atlas resource
- Row-level security ensures your credentials are only accessible to your own account
- To revoke access at any time, delete the integration in Stackwatch and delete the API key in Atlas
