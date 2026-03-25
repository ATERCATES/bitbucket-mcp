# GitHub Actions Setup for Auto-Publishing to NPM

This guide explains how to set up automatic publishing to NPM with every push to main.

## What the Workflow Does

The `auto-publish.yml` workflow:
1. ✅ Runs on every push to `main` or `master`
2. ✅ Lints, tests, and builds the code
3. ✅ Detects if source code changed since last release
4. ✅ Automatically bumps patch version (5.0.6 → 5.0.7)
5. ✅ Publishes to NPM
6. ✅ Creates a GitHub release
7. ✅ Skips publishing if only docs changed

## What You Need to Do

### 1. Create an NPM Token

1. Go to https://npmjs.com/settings/[YOUR_USERNAME]/tokens/new
2. Select **Granular Access Token**
3. Configure:
   - **Token Name**: `github-actions`
   - **Expiration**: 1 year
   - **Permissions**: 
     - Read and write access to `bitbucket-mcp`
4. Copy the token (you won't see it again)

### 2. Add NPM_TOKEN to GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
   - **Name**: `NPM_TOKEN`
   - **Value**: Paste your token from Step 1
4. Click **Add secret**

That's it! The workflow will automatically run on your next push to main.

## GitHub Token (Automatic)

The workflow uses `secrets.GITHUB_TOKEN` which is **automatically provided** by GitHub Actions. No manual setup needed.

## How to Trigger a Release

Simply push code to `main`:

```bash
git commit -m "feat: add new feature"
git push origin main
```

The workflow will:
- ✅ Run tests and lint checks
- ✅ Auto-bump version (patch)
- ✅ Publish to NPM
- ✅ Create GitHub release

To see the progress:
1. Go to your repo on GitHub
2. Click **Actions**
3. Find **Build, Test & Auto-Publish**
4. Watch the workflow run (takes 2-5 minutes)

## Manual Version Control

By default, the workflow bumps **patch** versions (5.0.6 → 5.0.7).

To bump **minor** or **major** versions:
1. Edit `package.json` manually
   - `5.0.6` → `5.1.0` (minor)
   - `5.0.6` → `6.0.0` (major)
2. Commit and push to main
3. Workflow will detect and publish

## Troubleshooting

### Workflow doesn't trigger
- ✅ Check: Did you push to `main` or `master`?
- ✅ Check: Did you change files in `src/`, `__tests__/`, or `package.json`?
- ✅ If still not triggering: Go to **Actions** tab → **Build, Test & Auto-Publish** → **Run workflow** → Select branch

### NPM publish fails
**Cause**: `NPM_TOKEN` not set or expired
**Fix**: Follow Step 1-2 above, ensure token is still valid

**Cause**: Package name already published
**Fix**: Check https://npmjs.com/package/bitbucket-mcp

### Tests fail
The workflow will fail and not publish. Fix errors locally:
```bash
pnpm lint
pnpm test
pnpm build
```

## What NOT to Do

❌ Don't manually edit `server.json` version (auto-synced)
❌ Don't manually tag releases (auto-created)
❌ Don't commit directly with `git push --force`
❌ Don't expose `NPM_TOKEN` in code or logs

## Environment Variables for Users

When users install the MCP server, they need these environment variables:

```bash
# Required (choose one)
export BITBUCKET_TOKEN="app_password"           # Recommended
# OR
export BITBUCKET_USERNAME="user@example.com"
export BITBUCKET_PASSWORD="app_password"

# Optional
export BITBUCKET_WORKSPACE="my-workspace"
export BITBUCKET_ALLOW_DANGEROUS=true            # Enable deletes
```

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for details.

## Files Modified by the Workflow

The workflow modifies these files automatically:
- `package.json` - Version bumped
- `server.json` - Version synced
- Git history - New commit and tag created

You don't need to manually update these.

## Verify Setup is Working

1. Make a small change to `src/` (e.g., update a comment)
2. Commit and push: `git push origin main`
3. Go to GitHub → **Actions** tab
4. Watch **Build, Test & Auto-Publish** workflow
5. When complete, check:
   - NPM: https://npmjs.com/package/bitbucket-mcp
   - GitHub: **Releases** tab (new release should appear)

## Support

For issues:
- Check the Actions log on GitHub for error details
- Verify `NPM_TOKEN` is set in Settings → Secrets
- Ensure local build works: `pnpm build && pnpm test`

