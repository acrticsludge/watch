# Connecting MongoDB Atlas

Stackwatch connects to MongoDB Atlas via the Atlas Admin API to track storage and connection usage across your clusters. Optionally, you can add a MongoDB connection string to get real-time data from M0/free-tier clusters and unlock per-database breakdowns on Pro.

---

## What Stackwatch tracks

### Always (Atlas Admin API)

| Metric | Plan | Description |
|--------|------|-------------|
| **Storage Used** | Free + Pro | Total data size across all databases, compared against your tier's storage limit |
| **Active Connections** | Free + Pro | Current open connection count vs the connection limit for your cluster tier |
| **Network In** (MB/h) | Pro only | Inbound network throughput (bytes/sec → MB/hour), compared against a 10 GB/day reference |
| **Network Out** (MB/h) | Pro only | Outbound network throughput, same reference |
| **CPU %** | Pro only (M2+) | Average system CPU utilisation across cluster nodes |
| **Resident Memory** | Pro only (M2+) | RAM used by the `mongod` process across nodes |
| **Avg Read Latency** | Pro only (M2+) | Average execution time for read operations (ms) |
| **Avg Write Latency** | Pro only (M2+) | Average execution time for write operations (ms) |
| **Disk Read IOPS** | Pro only (M2+) | Disk read operations per second |
| **Disk Write IOPS** | Pro only (M2+) | Disk write operations per second |
| **Replication Lag** | Pro only (M2+ replica sets) | How far the most-lagged secondary is behind the primary (seconds); only available when your cluster has at least one secondary node |

> **M0 note:** M0/shared clusters do not expose process measurements via the Atlas Admin API. Without a connection string, Storage and Active Connections will show as 0/limit, and the performance metrics above will not appear. Add a connection string (Step 4) to get real values.

### With connection string (optional)

| Metric | Plan | Description |
|--------|------|-------------|
| **Storage Used** | Free + Pro | Real compressed storage from `db.stats()` — replaces the 0/limit placeholder |
| **Active Connections** | Free + Pro | Real connection count from `serverStatus` |
| **DB Size** per database | Pro only | Per-database storage breakdown, shown as an expandable accordion in the dashboard |
| **Collection Size** per collection | Pro only | Per-collection storage, visible under each database in the accordion |
| **Resident Memory** | Pro only | RAM used by `mongod`, from `serverStatus.mem.resident` — works on M0 too |
| **Replication Lag** | Pro only | Max lag across secondaries, computed from `replSetGetStatus`; silently skipped on standalone nodes |
| **Slow Queries** | Pro only | Count of active operations running longer than 1 second (`currentOp`); not available on M0 shared clusters |

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
6. Copy both the **Public Key** (short alphanumeric string) and the **Private Key** (shown only once — save it now)
7. Add your outbound IP to the access list if your Atlas project requires IP allowlisting. If you're on Vercel, you may need to allowlist `0.0.0.0/0` or use a static egress IP.

---

## Step 3 — Connect in Stackwatch

1. Navigate to your project in the Stackwatch dashboard
2. Go to the project's **Integrations** tab
3. Find **MongoDB Atlas** and click **Add account**
4. Fill in the form:
   - **Atlas Public Key** — the short key from Step 2
   - **Atlas Private Key** — the long private key from Step 2 (stored encrypted)
   - **Project ID** — the 24-character ID from Step 1
   - **Account label** — a friendly name (e.g. `prod-cluster`)
5. Click **Connect**

Stackwatch will poll your cluster on the next cycle (within 15 minutes on Free, 5 minutes on Pro).

---

## Step 4 — Add a connection string (optional, for live M0 data)

If you're on an M0/free-tier cluster, or you want per-database and per-collection breakdowns on Pro, add a MongoDB connection string. This gives Stackwatch direct read-only access via `db.stats()` and `serverStatus`.

### Create a monitoring-only DB user

1. In Atlas, go to **Database Access** → **Add New Database User**
2. Choose **Password** authentication
3. Set a username (e.g. `stackwatch-monitor`) and a strong password
4. Leave **Built-In Role** unselected. Instead, expand **Specific Privileges** and add two entries:
   - **Privilege:** `clusterMonitor` — **Database:** `admin` — **Collection:** *(leave blank)*
   - **Privilege:** `readAnyDatabase` — **Database:** *(leave blank)* — **Collection:** *(leave blank)*

   > **Why both?** `clusterMonitor` grants access to monitoring commands (`serverStatus`, `replSetGetStatus`, `currentOp`) but does **not** include `listCollections` on individual databases. `readAnyDatabase` adds the ability to list and inspect collections — without it, the per-collection breakdown in the dashboard will show "No collection data". Together they give Stackwatch everything it needs while staying read-only.
5. Click **Add User**

### Get your connection string

1. In Atlas, go to **Database** → click **Connect** on your cluster
2. Choose **Drivers**
3. Copy the connection string and replace `<username>` and `<password>` with the credentials from above
4. The string looks like: `mongodb+srv://stackwatch-monitor:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Add it in Stackwatch

1. Go to the project's **Integrations** tab → find your MongoDB Atlas account → click the **edit (pencil)** icon
2. Paste the connection string into the **Connection String (optional)** field
3. Click **Save changes**

The next poll cycle will use the direct connection path. The "M0: add a connection string" warning in your dashboard will disappear once real data is returned.

> **Dashboard tip:** Once data is returned, the MongoDB card shows your **cluster name** (the label you set in Step 3) above the database accordion. Per-database and per-collection sizes expand beneath it when a connection string is present.

---

## Troubleshooting

### Status shows `error` with "Invalid API key"
- Double-check the **Public Key** and **Private Key** (no extra spaces)
- Verify the key pair hasn't been deleted in Atlas → Identity & Access → Applications → API Keys

### Status shows `error` with "lacks required access"
- The API key must have at least the **Project Read Only** role on the project
- Org-level roles alone are not sufficient — the key needs a project-level assignment

### Status shows `error` with "Project ID not found"
- Confirm the Project ID (24-character hex) is correct
- Make sure the API key is assigned to that specific project

### Dashboard shows 0/512 MB after connecting (M0 cluster)
- This is expected without a connection string — Atlas M0 clusters do not expose process measurements via the Admin API
- Follow Step 4 above to add a connection string and get real values

### Dashboard shows no data after adding connection string
- Verify the DB user has both `clusterMonitor` (Database: `admin`) and `readAnyDatabase` granted via **Specific Privileges**. The Atlas built-in role dropdown only shows 3 options and neither privilege is among them — they must be added as specific privileges. "Atlas admin" works but is overly permissive — never use it for monitoring.

### Per-collection breakdown shows "No collection data"
- The DB user is missing the `readAnyDatabase` privilege. `clusterMonitor` alone does **not** grant `listCollections` on individual databases. Add `readAnyDatabase` as a specific privilege (Database and Collection both blank) and wait for the next poll cycle.
- Check that the worker's IP is in the Atlas network access list (or set to `0.0.0.0/0`)
- Confirm the connection string format is correct (use SRV format: `mongodb+srv://...`)

### CPU, memory, latency, or IOPS metrics are missing
- These require an **M2 or higher** cluster — M0 shared clusters do not expose process measurements via the Atlas Admin API
- Confirm your Stackwatch account is on the **Pro** tier; these metrics are not collected on Free

### Replication Lag is not showing
- **Via Admin API:** your cluster must have at least one secondary node (replica set). Single-node clusters always report 0 lag and the metric is omitted
- **Via direct connection:** same — standalone `mongod` nodes do not run `replSetGetStatus`; the metric is silently skipped

### Slow Queries metric is missing
- `slow_queries_count` is only available via a direct connection string (not the Admin API)
- M0 shared clusters do not support the `currentOp` command — the metric will not appear on M0 even with a connection string

### IP allowlist errors
- Both the Atlas Admin API and direct connections require the worker's IP to be allowed
- Add the Railway egress IP, or set Atlas access to `0.0.0.0/0` for unrestricted access

---

## Security

- Your **Atlas Private Key** is encrypted with AES-256-GCM before being stored in the database
- Your **Connection String** (if provided) is also encrypted with AES-256-GCM — only the encrypted value is stored, the plaintext is never persisted
- `clusterMonitor` (on `admin`) grants monitoring commands only (`dbStats`, `serverStatus`, `replSetGetStatus`, `currentOp`). `readAnyDatabase` adds read-only access for `listCollections` and `collStats` — Stackwatch never writes to your databases
- Stackwatch uses the Admin API key **read-only** — it never creates, modifies, or deletes any Atlas resource
- Row-level security ensures your credentials are only accessible to your own account
- To revoke access: delete the integration in Stackwatch, delete the API key in Atlas, and remove the DB user created in Step 4
