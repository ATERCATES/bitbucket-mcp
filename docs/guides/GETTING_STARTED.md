# Getting Started with Bitbucket MCP

This guide will help you set up and use the Bitbucket MCP server.

## Prerequisites

- Node.js 18+ 
- Bitbucket Cloud account with API access
- An MCP client (Claude, Cursor, etc.)

## Installation

### Option 1: From NPM (Recommended)

```bash
npm install -g bitbucket-mcp
# or
pnpm add -g bitbucket-mcp
```

Then run:
```bash
bitbucket-mcp
```

### Option 2: NPX

```bash
npx -y bitbucket-mcp@latest
```

### Option 3: Local Development

```bash
git clone https://github.com/atercates/bitbucket-mcp.git
cd bitbucket-mcp
pnpm install
pnpm build
pnpm start
```

## Configuration

The server uses environment variables for configuration. Create a `.env` file or set these in your shell:

### Required
```bash
# One of these authentication methods:

# Option 1: Token Authentication (Recommended)
BITBUCKET_TOKEN=your_app_password_here

# Option 2: Basic Authentication
BITBUCKET_USERNAME=your_email@example.com
BITBUCKET_PASSWORD=your_app_password_here
```

### Optional
```bash
# API Configuration
BITBUCKET_URL=https://api.bitbucket.org/2.0  # Default URL
BITBUCKET_WORKSPACE=my-workspace              # Default workspace (auto-detected if not set)

# Security
BITBUCKET_ALLOW_DANGEROUS=true                # Allow delete operations (default: false)

# Logging
BITBUCKET_LOG_DISABLE=false                   # Disable file logging
BITBUCKET_LOG_FILE=/path/to/custom.log        # Custom log file path
BITBUCKET_LOG_DIR=/path/to/logs               # Custom log directory
BITBUCKET_LOG_PER_CWD=true                    # Create per-directory logs
```

## Getting Bitbucket Credentials

### Create an App Password

1. Go to https://bitbucket.org/account/settings/app-passwords/
2. Click "Create app password"
3. Give it a name (e.g., "MCP Server")
4. Select required permissions:
   - Pipelines: Read
   - Repositories: Read, Write (for PR operations)
   - Pull requests: Read, Write (for PR operations)
5. Copy the generated password
6. Set `BITBUCKET_TOKEN` to this password

### Find Your Workspace

1. Go to your Bitbucket workspace
2. The workspace name is in the URL: `https://bitbucket.org/{workspace}`
3. Or set `BITBUCKET_WORKSPACE` environment variable

## Using with Claude/Cursor

Add to your MCP configuration file (`.mcp.json` or similar):

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "bitbucket-mcp",
      "env": {
        "BITBUCKET_TOKEN": "${BITBUCKET_TOKEN}",
        "BITBUCKET_WORKSPACE": "my-workspace"
      }
    }
  }
}
```

Or with npx:

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["-y", "bitbucket-mcp@latest"],
      "env": {
        "BITBUCKET_TOKEN": "${BITBUCKET_TOKEN}",
        "BITBUCKET_WORKSPACE": "my-workspace"
      }
    }
  }
}
```

## Basic Operations

### List Repositories

```
Tool: listRepositories
Args: {
  "workspace": "my-workspace",
  "pagelen": 20
}
```

### Create a Pull Request

```
Tool: createPullRequest
Args: {
  "workspace": "my-workspace",
  "repo_slug": "my-repo",
  "title": "Add new feature",
  "description": "This PR adds support for X",
  "sourceBranch": "feature/new-feature",
  "targetBranch": "main",
  "reviewers": ["uuid1", "uuid2"]
}
```

### Approve a Pull Request

```
Tool: approvePullRequest
Args: {
  "workspace": "my-workspace",
  "repo_slug": "my-repo",
  "pull_request_id": "123"
}
```

### List Branches

```
Tool: listBranches
Args: {
  "workspace": "my-workspace",
  "repo_slug": "my-repo"
}
```

### Run a Pipeline

```
Tool: runPipeline
Args: {
  "workspace": "my-workspace",
  "repo_slug": "my-repo",
  "target": {
    "ref_type": "branch",
    "ref_name": "main"
  }
}
```

## Debugging

### View Logs

Logs are stored in platform-specific directories:

**macOS:**
```bash
tail -f ~/Library/Logs/bitbucket-mcp/bitbucket.log
```

**Linux:**
```bash
tail -f ~/.local/state/bitbucket-mcp/bitbucket.log
```

**Windows:**
```bash
Get-Content -Path "$env:LOCALAPPDATA\bitbucket-mcp\bitbucket.log" -Tail 50 -Wait
```

### Enable Verbose Logging

```bash
BITBUCKET_LOG_DISABLE=false bitbucket-mcp
```

### Test Connection

```bash
curl -X GET https://api.bitbucket.org/2.0/user \
  -u username:app_password
```

## Troubleshooting

### "Invalid credentials" error
- Verify `BITBUCKET_TOKEN` or `BITBUCKET_USERNAME`/`BITBUCKET_PASSWORD` are correct
- Check that app password has required permissions
- Ensure workspace name is correct

### "Workspace not found"
- Set `BITBUCKET_WORKSPACE` explicitly
- Or provide `workspace` parameter in every tool call
- Check workspace name is correct (case-sensitive)

### "Dangerous operation not allowed"
- Set `BITBUCKET_ALLOW_DANGEROUS=true` to enable delete operations
- This is intentionally restrictive for safety

### Pagination issues
- Use `pagelen` parameter to control page size (1-100)
- Use `all: true` to fetch all results automatically
- Check rate limits with `x-ratelimit-*` headers in logs

## FAQ

**Q: Can I use this with Bitbucket Server (self-hosted)?**
A: Yes! Set `BITBUCKET_URL` to your server URL:
```bash
BITBUCKET_URL=https://bitbucket.mycompany.com/rest/api/2.0
```

**Q: How do I use with multiple workspaces?**
A: Provide `workspace` parameter in each tool call, or run multiple instances with different `BITBUCKET_WORKSPACE` values.

**Q: Is it safe to enable dangerous operations?**
A: Yes, but be careful. These operations (delete branch/tag) cannot be undone. Only enable in trusted environments.

**Q: How do I contribute?**
A: See [CONTRIBUTING.md](../CONTRIBUTING.md) in the docs.

## Next Steps

- Read [TOOLS.md](../TOOLS.md) for complete tool reference
- Check [ARCHITECTURE.md](./architecture/ARCHITECTURE.md) for technical details
- See [examples/](./examples/) for common use cases
