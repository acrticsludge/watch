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

| Account type | Required scope |
|---|---|
| Personal account (your own billing) | `read:user` |
| Organization (org billing) | `read:org` |

> You do **not** need `repo`, `write:*`, or any other scope. Stackwatch only reads billing data.

6. Click **Generate token** and copy it immediately — GitHub only shows it once.

---

## Step 2 — Add the Integration in Stackwatch

1. Go to **Integrations** in the Stackwatch dashboard
2. Click **Add integration → GitHub Actions**
3. Paste your token into the **Personal Access Token** field
4. Give the integration a label (e.g. `my-org` or `personal`)
5. **Organization name (optional):** If you're monitoring an organization's billing (not your personal account), enter the org's slug (the name in the URL, e.g. `acme-corp` from `github.com/acme-corp`)

   Leave this blank to monitor your personal account's billing.

6. Click **Connect**

---

## What Gets Tracked

### Free tier

| Metric | Description |
|---|---|
| Actions minutes | Total minutes used vs your monthly included minutes |

### Pro tier (additional)

| Metric | Description |
|---|---|
| Actions minutes — Ubuntu | Ubuntu runner minutes |
| Actions minutes — macOS | macOS runner minutes (billed at 10x multiplier by GitHub) |
| Actions minutes — Windows | Windows runner minutes (billed at 2x multiplier by GitHub) |
| Packages bandwidth | GitHub Packages bandwidth used vs included GB |
| Actions storage | Shared storage used (artifacts, caches, packages) vs 0.5 GB free limit |
| Per-repo breakdown | Approximate minutes used per repository this month, derived from workflow run durations across your 20 most recently active repos |

> **Note on per-repo minutes:** These are approximated from workflow run durations, not the exact billing minutes GitHub charges. They're useful for identifying which repos are driving usage but may not match your GitHub billing page exactly.

---

## Troubleshooting

### "Invalid or expired Personal Access Token"
Your token has expired or was revoked. Generate a new one and reconnect the integration from the **Integrations** page.

### "Token lacks required permissions"
You're missing a scope. For personal billing, ensure `read:user` is checked. For org billing, ensure `read:org` is checked.

### "No Actions billing data for this plan"
The billing API returned a 404. This usually means the account has no GitHub Actions billing data exposed — common on free personal accounts with no Actions usage. The integration will still show as connected; data will appear once usage is recorded.

### Organization vs personal

If you're trying to monitor an org but left the org field blank (or vice versa), the wrong billing endpoint will be called. Check that the org slug in Stackwatch matches exactly what appears in your GitHub org URL.

---

## Token Rotation

GitHub PATs expire. When your token expires:

1. Generate a new token with the same scopes
2. In Stackwatch, go to **Integrations**, find your GitHub integration, and click **Edit**
3. Paste the new token and save

Stackwatch will resume polling on the next cycle.
