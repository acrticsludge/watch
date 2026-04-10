# Connecting GitHub Actions

Stackwatch tracks your GitHub Actions minutes, packages bandwidth, and shared storage against your plan's monthly limits.

---

## What You Need

A **GitHub Personal Access Token (PAT)** with the correct scopes for the account type you're connecting.

---

## Step 1 — Create a Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token → Generate new token (classic)**
3. Give it a descriptive name, e.g. `stackwatch-monitoring`
4. Set an expiry that suits your needs (90 days recommended — you'll need to reconnect when it expires)
5. Select the required scopes:

### Scopes

| Scope | Why it's needed |
|---|---|
| `repo` | Required to list repositories and read workflow run data for the per-repo breakdown (Pro) |
| `read:user` | Required to read personal account billing data |
| `read:org` | Required to read organization billing data |

> Select all three. If you only need personal-account billing and are on the Free tier (no per-repo breakdown), `read:user` alone is sufficient — but adding `repo` and `read:org` ensures everything works as you upgrade.

6. Click **Generate token** and copy it immediately — GitHub only shows it once.

---

## Step 2 — Add the Integration in Stackwatch

1. Navigate to your project in the Stackwatch dashboard
2. Go to the project's **Integrations** tab
3. Find **GitHub Actions** and click **Add account**
4. Paste your token into the **Personal Access Token** field
5. Give the integration a label (e.g. `my-org` or `personal`)
6. Click **Connect**

> To monitor an organization's billing instead of your personal account, enter the org slug (the name in the URL, e.g. `acme-corp` from `github.com/acme-corp`) in the **Organization name** field on the connect form. Leave it blank for personal account billing.

---

## What Gets Tracked

### Free tier

| Metric | Description |
|---|---|
| Actions minutes | Total minutes used vs your monthly included minutes |
| Per-project memory | Memory broken down per Railway project |
| Per-project CPU | CPU broken down per Railway project |

### Pro tier (additional)

| Metric | Description |
|---|---|
| Actions minutes — Ubuntu | Ubuntu runner minutes |
| Actions minutes — macOS | macOS runner minutes (billed at 10× multiplier by GitHub) |
| Actions minutes — Windows | Windows runner minutes (billed at 2× multiplier by GitHub) |
| Packages bandwidth | GitHub Packages bandwidth used vs included GB |
| Actions storage | Shared storage used (artifacts, caches, packages) vs 0.5 GB free limit |
| Per-repo breakdown | Approximate minutes used per repository this month, derived from workflow run durations across your 20 most recently active repos |

> **Note on per-repo minutes:** These are approximated from workflow run durations, not the exact billing minutes GitHub charges. They're useful for identifying which repos are driving usage but may not match your GitHub billing page exactly.

---

## Troubleshooting

### "Invalid or expired Personal Access Token"
Your token has expired or was revoked. Generate a new one and reconnect the integration from the project's **Integrations** tab.

### "Token lacks required permissions"
You're missing a scope. Ensure `read:user` is checked for personal billing, `read:org` for org billing, and `repo` for per-repo breakdown (Pro).

### "No Actions billing data for this plan"
The billing API returned a 404. This usually means the account has no GitHub Actions billing data exposed — common on free personal accounts with no Actions usage, and on accounts using GitHub's newer billing platform (post-2023). The integration will still show as connected; data will appear once usage is recorded under the legacy billing system.

### Organization vs personal
If you're trying to monitor an org but left the org field blank (or vice versa), the wrong billing endpoint will be called. Check that the org slug in Stackwatch matches exactly what appears in your GitHub org URL.

---

## Token Rotation

GitHub PATs expire. When your token expires:

1. Generate a new token with the same scopes
2. In Stackwatch, go to the project's **Integrations** tab, find your GitHub integration, and click the **edit (pencil)** icon
3. Paste the new token and save

Stackwatch will resume polling on the next cycle.
