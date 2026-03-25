# Environment Variables Reference

Complete list of environment variables needed to configure and deploy the Bitbucket MCP server.

## Authentication (Required - Select One)

### Token Authentication (Recommended)

```bash
# App password from Bitbucket
BITBUCKET_TOKEN=your_app_password_here
```

**How to get:**
1. Go to https://bitbucket.org/account/settings/app-passwords/
2. Click "Create app password"
3. Select permissions: Pipelines:Read, Repositories:Read+Write, Pull requests:Read+Write
4. Copy the generated password

### Basic Authentication

```bash
# Email and app password
BITBUCKET_USERNAME=your_email@example.com
BITBUCKET_PASSWORD=your_app_password_here
```

## Server Configuration (Optional)

```bash
# API base URL (defaults to Bitbucket Cloud)
BITBUCKET_URL=https://api.bitbucket.org/2.0

# For self-hosted Bitbucket Server:
BITBUCKET_URL=https://bitbucket.mycompany.com/rest/api/2.0

# Default workspace (auto-extracted if not set)
BITBUCKET_WORKSPACE=my-workspace

# Allow dangerous operations (delete branch, delete tag, etc.)
BITBUCKET_ALLOW_DANGEROUS=true  # default: false
```

## Logging Configuration (Optional)

```bash
# Disable file-based logging
BITBUCKET_LOG_DISABLE=true

# Custom log file path
BITBUCKET_LOG_FILE=/var/log/bitbucket-mcp/server.log

# Custom log directory
BITBUCKET_LOG_DIR=/var/log/bitbucket-mcp

# Create per-working-directory subdirectories
BITBUCKET_LOG_PER_CWD=true
```

## NPM Publishing (Deployment)

### Local Deployment

```bash
# npm account credentials
# These are configured via: npm login
# Stored in: ~/.npmrc (do NOT commit)
```

### CI/CD Deployment (GitHub Actions, etc.)

```bash
# npm access token for automation
NPM_TOKEN=npm_your_token_here_1234567890

# or use npm credentials
NPM_USERNAME=your_npm_username
NPM_PASSWORD=your_npm_password
NPM_EMAIL=your_email@example.com
```

**How to get NPM_TOKEN:**
1. Go to https://www.npmjs.com/settings/~/tokens
2. Click "Generate New Token"
3. Select type: "Automation" (for CI/CD)
4. Copy the token
5. Add to GitHub Secrets as `NPM_TOKEN`

## Development Environment

```bash
# Development mode (use tsx watch)
NODE_ENV=development
pnpm dev

# Production build
NODE_ENV=production
pnpm build
pnpm start
```

## Complete Example: Local Setup

```bash
# Step 1: Create app password on Bitbucket
# Go to https://bitbucket.org/account/settings/app-passwords/

# Step 2: Set environment variables
export BITBUCKET_TOKEN="your_app_password"
export BITBUCKET_WORKSPACE="my-workspace"

# Optional: Enable logging
export BITBUCKET_LOG_DISABLE=false

# Optional: Allow dangerous operations
export BITBUCKET_ALLOW_DANGEROUS=true

# Step 3: Run the server
pnpm start
# OR
npx -y bitbucket-mcp@latest
```

## Complete Example: Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build

ENV BITBUCKET_TOKEN=${BITBUCKET_TOKEN}
ENV BITBUCKET_WORKSPACE=${BITBUCKET_WORKSPACE}
ENV BITBUCKET_LOG_DISABLE=false
ENV BITBUCKET_ALLOW_DANGEROUS=${BITBUCKET_ALLOW_DANGEROUS:-false}

CMD ["node", "dist/index.js"]
```

```bash
# Run Docker container
docker run -e BITBUCKET_TOKEN=your_token \
           -e BITBUCKET_WORKSPACE=my-workspace \
           bitbucket-mcp:latest
```

## Complete Example: GitHub Actions Workflow

```yaml
name: Deploy to npm

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
      - run: pnpm test
      - run: pnpm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**GitHub Secrets to configure:**
- `NPM_TOKEN`: npm automation token

## Configuration by Environment

### Development

```bash
BITBUCKET_TOKEN=dev_token
BITBUCKET_WORKSPACE=dev-workspace
BITBUCKET_LOG_DISABLE=false
BITBUCKET_ALLOW_DANGEROUS=true
NODE_ENV=development
```

### Staging

```bash
BITBUCKET_TOKEN=staging_token
BITBUCKET_WORKSPACE=staging-workspace
BITBUCKET_LOG_DISABLE=false
BITBUCKET_ALLOW_DANGEROUS=false
NODE_ENV=production
```

### Production

```bash
BITBUCKET_TOKEN=${BITBUCKET_TOKEN}
BITBUCKET_WORKSPACE=${BITBUCKET_WORKSPACE}
BITBUCKET_LOG_DISABLE=false
BITBUCKET_ALLOW_DANGEROUS=false
NODE_ENV=production
```

## Environment Variable Priority

When multiple configuration sources exist, priority is:

1. **Command-line environment variables** (highest)
   ```bash
   BITBUCKET_TOKEN=value pnpm start
   ```

2. **.env file in current directory**
   ```bash
   # .env
   BITBUCKET_TOKEN=value
   ```

3. **.env.local file** (for local overrides)
   ```bash
   # .env.local (in .gitignore)
   BITBUCKET_TOKEN=local_value
   ```

4. **System environment variables**
   ```bash
   export BITBUCKET_TOKEN=value
   ```

5. **Default values** (lowest, if any)

## Security Best Practices

1. **Never commit secrets**
   - Add `.env` and `.env.local` to `.gitignore`
   - Store tokens in environment or secret management

2. **Use strong tokens**
   - Use app passwords with minimal required scopes
   - Rotate tokens regularly

3. **Enable 2FA on npm account**
   - https://docs.npmjs.com/about-two-factor-authentication

4. **Use specific npm tokens for CI/CD**
   - Create automation tokens instead of personal tokens
   - Restrict token scope to "publish"

5. **Disable dangerous operations in production**
   - Only set `BITBUCKET_ALLOW_DANGEROUS=true` in development
   - This prevents accidental data loss

## Troubleshooting

### "Invalid credentials" error

```bash
# Verify token is set
echo $BITBUCKET_TOKEN

# Test credentials
curl -X GET https://api.bitbucket.org/2.0/user \
  -H "Authorization: Bearer $BITBUCKET_TOKEN"
```

### "Workspace not found"

```bash
# Verify workspace name
echo $BITBUCKET_WORKSPACE

# List your workspaces
curl -X GET https://api.bitbucket.org/2.0/workspaces \
  -H "Authorization: Bearer $BITBUCKET_TOKEN"
```

### npm publish fails with "ENEEDAUTH"

```bash
# Check npm login
npm whoami

# Login again
npm login

# Or use token directly
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
```

## See Also

- [Getting Started Guide](GETTING_STARTED.md)
- [NPM Deployment Guide](NPM_DEPLOYMENT.md)
- [Architecture Documentation](../architecture/ARCHITECTURE.md)
