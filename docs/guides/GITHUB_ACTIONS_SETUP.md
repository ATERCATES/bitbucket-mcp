# GitHub Actions Setup for Auto-Publishing

This guide explains how to configure GitHub Actions for automatic NPM publishing on every push to main.

## What You Need

Before the auto-publishing workflow will work, you need to set up GitHub secrets and repository configuration.

## Step 1: Create NPM Token

1. Go to https://npmjs.com/settings/[YOUR_USERNAME]/tokens
2. Click "Generate New Token" → "Granular Access Token"
3. Configure:
   - **Token Name**: `github-actions` or similar
   - **Expiration**: 1 year (or unlimited)
   - **Permissions**:
     - Packages and scopes: Read and write access to `bitbucket-mcp`
     - Organization access: Not required (unless publishing to org)
4. Copy the generated token

## Step 2: Add NPM_TOKEN to GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste the token from Step 1
6. Click **Add secret**

## Step 3: Verify GitHub Token

The workflow uses `secrets.GITHUB_TOKEN` which is **automatically provided** by GitHub Actions. No manual setup needed.

However, make sure your repository settings allow:
- Writing to the repository (for version tags and commits)
- Creating releases

This is configured in the workflow with:
```yaml
permissions:
  contents: write  # Allow creating commits and tags
  id-token: write  # OIDC authentication to NPM
```

## Step 4: Configure Repository Settings (Optional)

For automatic merging and CI checks:

1. Go to **Settings** → **Branch protection rules**
2. Create a rule for `main` (or `master`):
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date
   - ✅ Include administrators

## How It Works

### Trigger
The workflow runs automatically when:
- You push to `main` or `master` branch
- AND files in `src/`, `package.json`, or the workflow itself change

### Process
1. **Checkout code** and install dependencies
2. **Run linter** (`pnpm lint`)
3. **Run tests** (`pnpm test`)
4. **Build** the package (`pnpm build`)
5. **Check for changes** since the last tag
6. If changes exist in `src/`:
   - Bump version automatically (`pnpm publish:patch`)
   - Publish to NPM
   - Publish to MCP Registry
   - Create GitHub release
7. If no source changes, skip (only doc updates, etc.)

### Version Bumping

The workflow uses semantic versioning:
- **Patch** - Bug fixes, minor changes (automatic)
- To trigger **minor** or **major** bumps, edit `package.json` version manually

Example: Change `"version": "5.0.6"` to `"version": "5.1.0"` in `package.json`, then push.

## Workflow Files

### `auto-publish.yml` (NEW)
Runs on every push to main/master. Automatically detects changes and publishes if needed.

**Advantages:**
- ✅ Automatic versioning and publishing
- ✅ Skips publishing if only docs changed
- ✅ Single source of truth (main branch)
- ✅ No manual tagging required

### `publish-mcp.yml` (EXISTING)
Manual workflow triggered by version tags (`v*`). Kept for backward compatibility.

**Use when:**
- You want to manually control releases
- You're testing a release locally first
- You want more control over versioning

## Manual Publishing (if needed)

If auto-publishing fails or you need manual control:

```bash
# Bump and publish patch version
pnpm publish:patch

# Bump and publish minor version
pnpm publish:minor

# Bump and publish major version
pnpm publish:major
```

These commands will:
1. Update version in `package.json`
2. Update `server.json` version
3. Create a git commit with semantic versioning
4. Create a git tag (e.g., `v5.0.7`)
5. Publish to NPM

## Troubleshooting

### Workflow doesn't trigger

**Check:**
1. Is the workflow enabled? Go to **Actions** → should see `auto-publish.yml`
2. Did you push to `main` or `master`? (Check your default branch)
3. Did you change files in `src/`, `package.json`, or the workflow?

If still not triggering:
- Manually trigger: Go to **Actions** → **Auto-publish to NPM and MCP Registry** → **Run workflow** → select `main`

### NPM publish fails

**Common causes:**
- `NPM_TOKEN` not set (follow Step 2 above)
- Token expired (generate a new one)
- Package name conflict (already exists on NPM)
- Version already published (bump the version number)

**Check:**
```bash
npm view bitbucket-mcp versions
```

### MCP Registry publish fails

**Common causes:**
- `server.json` invalid (run `node scripts/validate-server-json.mjs` locally)
- MCP Registry is down (check https://github.com/modelcontextprotocol/registry)
- Already published (check if version exists)

## Environment Variables Needed for Deployment

When users set up the MCP server, they'll need:

```bash
# Required (one of these)
BITBUCKET_TOKEN=npm_xxxxxxx          # App password
# OR
BITBUCKET_USERNAME=user@example.com  # Email
BITBUCKET_PASSWORD=app_password       # App password

# Optional
BITBUCKET_WORKSPACE=my-workspace      # Default workspace
BITBUCKET_ALLOW_DANGEROUS=true         # Enable delete operations
BITBUCKET_LOG_DISABLE=false            # File logging
```

These are NOT GitHub secrets - they're user's Bitbucket credentials.

## Verify Setup

Once configured, test by:

1. Making a small change to `src/` (e.g., update a comment)
2. Commit and push to main
3. Go to **Actions** on GitHub
4. Watch `auto-publish to NPM and MCP Registry` workflow
5. Should complete in 2-5 minutes

If successful:
- ✅ New version on https://npmjs.com/package/bitbucket-mcp
- ✅ New release on GitHub
- ✅ Listed in MCP Registry

## Support

If you have issues:

1. Check the Actions logs on GitHub for error messages
2. Verify secrets are set correctly (`settings/secrets`)
3. Run `pnpm build && pnpm test` locally to ensure no issues
4. Check NPM token isn't expired

For more details on GitHub Actions with Node.js projects:
- https://docs.github.com/en/actions/guides/publishing-nodejs-packages

For MCP Registry publishing:
- https://github.com/modelcontextprotocol/registry
