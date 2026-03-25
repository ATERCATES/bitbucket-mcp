# Deploying to NPM

This guide explains how to deploy the Bitbucket MCP server to npm.

## Prerequisites

- npm account at https://www.npmjs.com/
- Local npm authentication (`npm login`)
- Git repository with version control
- Access to bump version numbers

## Setup

### 1. Create NPM Account

If you don't have an npm account:
1. Go to https://www.npmjs.com/signup
2. Create your account
3. Verify your email

### 2. Local npm Login

```bash
npm login
```

This will prompt for:
- **Username**: Your npm username
- **Password**: Your npm password
- **Email**: Email associated with your account
- **Two-Factor Authentication** (2FA): If enabled, provide your 2FA code

Your credentials are saved to `~/.npmrc` (do not commit this file).

### 3. Verify Ownership

Ensure you own the `bitbucket-mcp` package on npm. If not, you'll need to:
- Contact the current owner for permissions, or
- Use a different package name

## Deployment Process

### Option 1: Automated Script (Recommended)

Use the npm version scripts in `package.json`:

```bash
# Patch version bump (5.0.6 → 5.0.7)
pnpm publish:patch

# Minor version bump (5.0.6 → 5.1.0)
pnpm publish:minor

# Major version bump (5.0.6 → 6.0.0)
pnpm publish:major

# Alias for patch
pnpm release
```

This will:
1. Build the project
2. Bump the version in package.json
3. Commit the version change
4. Tag the commit with git
5. Publish to npm
6. Push changes and tags to GitHub

### Option 2: Manual Process

If you prefer more control:

```bash
# 1. Build the project
pnpm build

# 2. Manually bump version (edit package.json)
# Change: "version": "5.0.6" → "5.0.7"

# 3. Commit the change
git add package.json
git commit -m "chore: bump version to 5.0.7"
git tag v5.0.7

# 4. Publish to npm
pnpm publish

# 5. Push changes to GitHub
git push origin master --tags
```

## Environment Variables for CI/CD

If deploying from CI/CD (GitHub Actions, GitLab CI, etc.), set:

```bash
# GitHub Actions example
NPM_TOKEN=your_npm_access_token
```

Configure in your repository secrets or CI/CD provider.

### Getting NPM Access Token

1. Go to https://www.npmjs.com/settings/~/tokens
2. Click "Generate New Token"
3. Select token type:
   - **Automation** - For CI/CD deployments (recommended)
   - **Publish** - For publishing packages
4. Copy the token
5. Add to GitHub Secrets as `NPM_TOKEN`

### GitHub Actions Workflow

Example `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      - run: pnpm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Pre-Deployment Checklist

Before deploying, verify:

- ✅ All tests pass: `pnpm test`
- ✅ Linting is clean: `pnpm lint`
- ✅ Code is formatted: `pnpm format`
- ✅ Build succeeds: `pnpm build`
- ✅ README is updated
- ✅ CHANGELOG.md is updated
- ✅ Version number is bumped correctly
- ✅ No sensitive data in code
- ✅ package.json has correct metadata
- ✅ .npmignore is configured properly

## Verification After Deployment

After publishing:

1. **Check npm package page:**
   ```
   https://www.npmjs.com/package/bitbucket-mcp
   ```

2. **Install and test locally:**
   ```bash
   npm install -g bitbucket-mcp
   bitbucket-mcp --version
   ```

3. **Verify with npx:**
   ```bash
   npx -y bitbucket-mcp@latest
   ```

4. **Check GitHub release:**
   - Tag is created
   - Release notes are visible

## Troubleshooting

### "403 Forbidden" Error

**Problem:** Cannot publish to npm

**Solutions:**
- Verify npm login: `npm whoami`
- Check package name is available (or you own it)
- Verify credentials in `~/.npmrc`
- Check 2FA is configured correctly

### "ENEEDAUTH" Error

**Problem:** Not authenticated with npm

**Solution:**
```bash
npm logout
npm login
```

### "Version already published"

**Problem:** Cannot publish duplicate version

**Solution:**
```bash
# Bump version and try again
pnpm publish:patch
```

### Package not appearing on npm

**Problem:** Published but not visible

**Solutions:**
- Wait 2-5 minutes for npm CDN to sync
- Clear npm cache: `npm cache clean --force`
- Check https://www.npmjs.com/package/bitbucket-mcp for latest version
- Verify you're logged in as correct user: `npm whoami`

## Best Practices

1. **Version Numbering** - Use semantic versioning (MAJOR.MINOR.PATCH)
2. **Changelog** - Update CHANGELOG.md before each release
3. **Tags** - Always use git tags matching version (v5.0.7)
4. **Testing** - Run full test suite before publishing
5. **2FA** - Enable 2FA on npm account for security
6. **Access Tokens** - Use granular tokens in CI/CD
7. **Documentation** - Keep README and docs up to date

## Rolling Back a Release

If you accidentally publish a bad version:

```bash
npm unpublish bitbucket-mcp@5.0.7
```

Then:
1. Fix the issue
2. Test thoroughly
3. Bump to a new version
4. Publish again

Note: npm has restrictions on unpublishing after 72 hours.

## Monitoring Package Health

- **Package page:** https://www.npmjs.com/package/bitbucket-mcp
- **Weekly downloads:** Visible on package page
- **Issues:** GitHub Issues section
- **Quality score:** npm calculates based on tests, docs, links, etc.

## Contact

For npm support:
- npm Help: https://docs.npmjs.com/
- npm Support: support@npmjs.com
