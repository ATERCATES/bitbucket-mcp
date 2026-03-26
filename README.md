# Bitbucket MCP Server

A Model Context Protocol (MCP) server for integrating with Bitbucket Cloud and Server APIs. This MCP server enables AI assistants like Claude and Cursor to interact with your Bitbucket repositories, pull requests, pipelines, and other resources.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@atercates/bitbucket-mcp.svg)](https://www.npmjs.com/package/@atercates/bitbucket-mcp)

## Features

✨ **Comprehensive Bitbucket Integration** - 59 tools covering repositories, PRs, branches, commits, pipelines, and more

🔒 **Secure Authentication** - App password tokens or basic auth with granular permission control via Bitbucket

📝 **Well-Documented** - Complete API reference, architecture guides, and deployment instructions in `/docs`

🧪 **Fully Tested** - Comprehensive unit test suite with full tool coverage (Vitest)

⚡ **Modular Design** - Clean, maintainable architecture organized by feature domain (11 handler modules)

🛡️ **Safety First** - Dangerous operations (deletes) require explicit `BITBUCKET_ALLOW_DANGEROUS=true`

🚀 **Production Ready** - Built with pnpm, ESLint, Prettier, and modern TypeScript

## Quick Start

### Installation

```bash
# Option 1: Global install
pnpm add -g @atercates/bitbucket-mcp

# Option 2: Use with NPX (no installation required)
npx -y @atercates/bitbucket-mcp@latest

# Option 3: Local development
git clone https://github.com/ATERCATES/bitbucket-mcp.git
cd bitbucket-mcp
pnpm install
pnpm build
pnpm start
```

### Configuration

**REQUIRED Environment Variables:**

```bash
# Authentication (Personal API Token ONLY)
export BITBUCKET_USERNAME="user@example.com"    # Your Atlassian email address
export BITBUCKET_API_TOKEN="ATBBxxxxxxxxxxxxx"  # Personal API Token (starts with ATBB or ATATT)

# Default Workspace (optional but recommended)
export BITBUCKET_WORKSPACE="my-workspace"       # Your default workspace name
```

**Optional Configuration:**

```bash
# Enable dangerous operations (delete branch, delete tag, etc.)
export BITBUCKET_ALLOW_DANGEROUS=true

# Custom API URL (for self-hosted Bitbucket Server)
export BITBUCKET_URL="https://bitbucket.company.com/rest/api/2.0"
```

**⚠️ Authentication Notes:**
- This MCP server strictly enforces **Personal API Tokens** (starting with `ATBB` or `ATATT`)
- App Passwords and Access Tokens (BBAT-xxx) are **NOT supported**
- `BITBUCKET_USERNAME` must be your Atlassian email address

### Running the Server

```bash
# If installed globally
bitbucket-mcp

# If using NPX
npx -y @atercates/bitbucket-mcp@latest

# If installed locally
pnpm start
```

The server will start and listen for MCP protocol connections via stdio.

## Integration with MCP Clients

### Claude / Cursor Configuration

Add to your MCP configuration (`.mcp.json` or similar):

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "bitbucket-mcp",
      "env": {
        "BITBUCKET_USERNAME": "user@example.com",
        "BITBUCKET_API_TOKEN": "ATBBxxxxxxxxxxxxx",
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
      "args": ["-y", "@atercates/bitbucket-mcp@latest"],
      "env": {
        "BITBUCKET_USERNAME": "user@example.com",
        "BITBUCKET_API_TOKEN": "ATBBxxxxxxxxxxxxx",
        "BITBUCKET_WORKSPACE": "my-workspace"
      }
    }
  }
}
```

## Available Tools

The server provides 59 tools organized into 11 categories:

| Category | Tools |
|----------|-------|
| **Repositories** | List, get, create repositories |
| **Pull Requests** | Create, approve, merge, decline PRs |
| **PR Comments** | Create, delete PR comments |
| **PR Tasks** | Create, update, delete PR tasks (TODOs) |
| **PR Content** | Get diffs and commits |
| **Branches & Tags** | List, create, delete branches and tags |
| **Commits** | List commits and commit details |
| **Pipelines** | List, run, stop pipeline runs |
| **Source Code** | Read file content from repositories |
| **Users** | Get current user and workspace info |
| **Branching Model** | Get branching strategy configuration |

**Complete reference:** See [docs/TOOLS.md](docs/TOOLS.md)

## Environment Variables

### Authentication (Required)

- `BITBUCKET_USERNAME` - Your Atlassian email address (e.g., `user@example.com`)
- `BITBUCKET_API_TOKEN` - Personal API Token starting with `ATBB-` or `ATATT-`

**How to create:**
1. Go to https://bitbucket.org/account/settings/app-passwords/
2. Click "Create API token"
3. Select permissions: Repositories (Read, Write), Pull requests (Read, Write), Pipelines (Read)
4. Copy the generated token
5. Set expiration date (max 1 year)

### Configuration (Optional)

- `BITBUCKET_WORKSPACE` - Default workspace name (can be provided per-tool call)
- `BITBUCKET_URL` - API base URL (default: `https://api.bitbucket.org/2.0`)
- `BITBUCKET_ALLOW_DANGEROUS` - Enable delete operations (default: `false`)

### Logging (Optional)

- `BITBUCKET_LOG_DISABLE` - Disable file logging (default: `false`)
- `BITBUCKET_LOG_FILE` - Custom log file path
- `BITBUCKET_LOG_DIR` - Custom log directory
- `BITBUCKET_LOG_PER_CWD` - Create per-directory logs (default: `false`)

## Documentation

- **[Tools Reference](docs/TOOLS.md)** - Complete API documentation for all 59 tools with examples
- **[Architecture Guide](docs/architecture/ARCHITECTURE.md)** - Technical design, modular structure, and extension guide

## Development

### Prerequisites

- Node.js 24
- pnpm (or npm)

### Setup

```bash
git clone https://github.com/ATERCATES/bitbucket-mcp.git
cd bitbucket-mcp
pnpm install
```

### Build

```bash
pnpm build          # Compile TypeScript
pnpm lint           # Run ESLint  
pnpm format         # Format with Prettier
pnpm format:check   # Check formatting
```

### Testing

```bash
pnpm test           # Run Vitest suite
pnpm test:watch     # Watch mode
```

### Running in Development

```bash
pnpm dev            # Run with tsx (watch mode, no build required)
# OR
pnpm build && pnpm start
```

### MCP Inspector (Debugging)

```bash
pnpm inspector      # Launch interactive MCP inspector to test tools
```

## Project Structure

```
src/
├─ index.ts              # Entry point
├─ server.ts             # MCP server orchestration
├─ client.ts             # Bitbucket API client
├─ config.ts             # Configuration management
├─ logger.ts             # File-based logging
├─ types.ts              # TypeScript definitions
├─ schemas.ts            # JSON schemas
├─ utils.ts              # Utilities
├─ pagination.ts         # Pagination helper
└─ handlers/             # Feature modules
   ├─ repositories.ts
   ├─ pull-requests.ts
   ├─ pr-comments.ts
   ├─ pr-tasks.ts
   ├─ pr-content.ts
   ├─ refs.ts
   ├─ commits.ts
   ├─ pipelines.ts
   ├─ source.ts
   ├─ users.ts
   ├─ branching-model.ts
   └─ index.ts

docs/
├─ TOOLS.md              # Tools reference
└─ architecture/
   └─ ARCHITECTURE.md    # Technical design

__tests__/
├─ test-utils.ts         # Test helpers
└─ handlers/             # Handler tests
```

## Architecture

The server uses a modular handler-based architecture:

```
MCP Client → Server → Handler Modules → BitbucketClient → Bitbucket API
```

Each handler module:
- Defines tools (names, schemas, descriptions)
- Implements handlers (async functions)
- Can mark tools as dangerous
- Is automatically registered by the server

See [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) for details.

## Dangerous Operations

Some tools that perform destructive operations are marked as dangerous:

- `deletePullRequestComment`
- `deletePullRequestTask`
- `deleteBranch`
- `deleteTag`

These require `BITBUCKET_ALLOW_DANGEROUS=true` to use, preventing accidental data loss.

## Troubleshooting

### Authentication Issues

**Test your credentials:**
```bash
# Test Personal API Token
curl -u "user@example.com:ATBBxxxxxx" \
  https://api.bitbucket.org/2.0/user

# Should return your user info if credentials are valid
```

**Common errors:**

1. **"BITBUCKET_USERNAME is required"**
   - Set `BITBUCKET_USERNAME` to your Atlassian email address.

2. **"BITBUCKET_API_TOKEN is required"**
   - Set `BITBUCKET_API_TOKEN` to your Personal API Token (starts with ATBB).

3. **"Invalid token format"**
   - The token must start with `ATBB`. App passwords and Access Tokens are not supported.

4. **"401 Unauthorized"**
   - Check username/token are correct
   - Verify token hasn't expired (max 1 year)
   - Ensure you are using your **email address** as username

### View Logs

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

### Self-Hosted Bitbucket

For self-hosted Bitbucket Server, set the API URL:

```bash
BITBUCKET_URL=https://bitbucket.mycompany.com/rest/api/2.0 bitbucket-mcp
```

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Support

- 🔧 Check [docs/TOOLS.md](docs/TOOLS.md) for tool documentation with examples
- 🏗️ Review [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) for technical details
- 🐛 Enable logging with `BITBUCKET_LOG_DISABLE=false` for debugging
- 🐞 Report issues at https://github.com/ATERCATES/bitbucket-mcp/issues

---

**Architecture:** Modular handler-based design with 11 feature modules  
**Test Framework:** Vitest  
**Package Manager:** pnpm
