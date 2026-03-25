# GitHub Actions Setup - What You Need to Configure

## TL;DR: Only 1 Secret Required

1. Get NPM token: https://npmjs.com/settings/[YOUR_USERNAME]/tokens
   - Create "Granular Access Token"
   - Give write access to `bitbucket-mcp` package
   - Copy the token

2. Add to GitHub:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: [paste token]
   - Save

3. That's it! Your workflow is ready.

## What Happens Automatically

Every time you push to `main`:
- ✅ Tests run
- ✅ Build runs
- ✅ If source code changed: bump version, publish to NPM
- ✅ GitHub release created automatically
- ✅ If only docs changed: skip (don't bump version)

## Environment Variables Needed

### For GitHub Actions (what you configure)
- `NPM_TOKEN` - Your NPM authentication token (GitHub Secret)

That's all. `GITHUB_TOKEN` is automatic.

### For Users Installing the MCP Server (not GitHub)
Users need to set these when running the server:

```bash
# Required (pick one)
export BITBUCKET_TOKEN="your_app_password"
# OR
export BITBUCKET_USERNAME="your_email@example.com"
export BITBUCKET_PASSWORD="your_app_password"

# Optional
export BITBUCKET_WORKSPACE="my-workspace"
export BITBUCKET_ALLOW_DANGEROUS=true
```

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for complete reference.

## How to Trigger a Release

Just commit and push to main:
```bash
git commit -m "feat: add new feature"
git push origin main
```

The workflow automatically:
1. Runs tests
2. Builds
3. Bumps patch version (5.0.6 → 5.0.7)
4. Publishes to NPM
5. Creates GitHub release

Done! No tags, no manual steps.

## To Bump Minor/Major Versions

Edit `package.json`:
- From `5.0.6` to `5.1.0` (minor)
- From `5.0.6` to `6.0.0` (major)

Then push. The workflow handles the rest.

## Files Modified by Workflow

Workflow automatically updates:
- `package.json` - Version bumped
- `server.json` - Version synced
- Git history - New tag created

You never manually edit these.

## Verify It's Working

1. Make a small code change
2. Push to main
3. Go to GitHub → **Actions** tab
4. Watch "Build, Test & Auto-Publish" workflow
5. When done, check: https://npmjs.com/package/bitbucket-mcp

If you see your new version there, it's working! 🎉
