# Bitbucket MCP Server

A Model Context Protocol (MCP) server for integrating with Bitbucket Cloud and Server APIs. This MCP server enables AI assistants like Claude and Cursor to interact with your Bitbucket repositories, pull requests, pipelines, and other resources.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/bitbucket-mcp.svg)](https://www.npmjs.com/package/bitbucket-mcp)

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
# Option 1: Global install with NPM
npm install -g bitbucket-mcp

# Option 2: Use with NPX (no installation required)
npx -y bitbucket-mcp@latest

# Option 3: Local development
git clone <repository>
cd bitbucket-mcp
pnpm install
pnpm build
pnpm start
```

### Configuration

Set environment variables before running:

```bash
# Authentication (choose one method)
export BITBUCKET_TOKEN="your_app_password"
# OR
export BITBUCKET_USERNAME="your_email@example.com"
export BITBUCKET_PASSWORD="your_app_password"

# Basic configuration
export BITBUCKET_WORKSPACE="my-workspace"  # Optional: default workspace

# Optional: Enable dangerous operations (delete branch, delete tag, etc.)
export BITBUCKET_ALLOW_DANGEROUS=true
```

### Running the Server

```bash
# If installed globally
bitbucket-mcp

# If using NPX
npx -y bitbucket-mcp@latest

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
        "BITBUCKET_TOKEN": "your_app_password",
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
        "BITBUCKET_TOKEN": "your_app_password",
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

### Authentication (Required - one method)

- `BITBUCKET_TOKEN` - App password (recommended)
- OR `BITBUCKET_USERNAME` + `BITBUCKET_PASSWORD` - Basic authentication

### Configuration (Optional)

- `BITBUCKET_URL` - API base URL (default: `https://api.bitbucket.org/2.0`)
- `BITBUCKET_WORKSPACE` - Default workspace name
- `BITBUCKET_ALLOW_DANGEROUS` - Enable delete operations (default: false)

### Logging (Optional)

- `BITBUCKET_LOG_DISABLE` - Disable file logging (default: false)
- `BITBUCKET_LOG_FILE` - Custom log file path
- `BITBUCKET_LOG_DIR` - Custom log directory
- `BITBUCKET_LOG_PER_CWD` - Create per-directory logs (default: false)

## Getting Credentials

### Create Bitbucket App Password

1. Go to https://bitbucket.org/account/settings/app-passwords/
2. Click "Create app password"
3. Give it a name (e.g., "MCP Server")
4. Select permissions:
   - Pipelines: Read
   - Repositories: Read, Write
   - Pull requests: Read, Write
5. Copy the generated password
6. Set `BITBUCKET_TOKEN` to this password

### Find Your Workspace

The workspace name is visible in your Bitbucket URL: `https://bitbucket.org/{workspace}`

## Documentation

- **[Getting Started Guide](docs/guides/GETTING_STARTED.md)** - Installation, configuration, and basic usage
- **[Tools Reference](docs/TOOLS.md)** - Complete API documentation for all 59 tools with examples
- **[Architecture Guide](docs/architecture/ARCHITECTURE.md)** - Technical design, modular structure, and extension guide
- **[Environment Variables](docs/guides/ENVIRONMENT_VARIABLES.md)** - Complete reference for all configuration options
- **[NPM Deployment](docs/guides/NPM_DEPLOYMENT.md)** - Publishing and deployment instructions
- **[Main Documentation](docs/README.md)** - Overview and quick links

## Development

### Prerequisites

- Node.js 18+
- pnpm (or npm)

### Setup

```bash
git clone <repository>
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
├─ README.md             # Documentation overview
├─ TOOLS.md              # Tools reference
├─ guides/
│  └─ GETTING_STARTED.md # Setup guide
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

```bash
# Test your credentials
curl -X GET https://api.bitbucket.org/2.0/user \
  -u your_username:your_app_password
```

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

- 📖 See [docs/guides/GETTING_STARTED.md](docs/guides/GETTING_STARTED.md) for setup help
- 🔧 Check [docs/TOOLS.md](docs/TOOLS.md) for tool documentation with examples
- 🏗️ Review [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) for technical details
- ⚙️ Check [docs/guides/ENVIRONMENT_VARIABLES.md](docs/guides/ENVIRONMENT_VARIABLES.md) for all configuration options
- 🚀 See [docs/guides/NPM_DEPLOYMENT.md](docs/guides/NPM_DEPLOYMENT.md) for deployment to NPM
- 🐛 Enable logging with `BITBUCKET_LOG_DISABLE=false` for debugging
- 📝 Check [docs/README.md](docs/README.md) for complete documentation index

---

**Version:** 5.0.6  
**Last Updated:** January 2025  
**Architecture:** Modular handler-based design with 11 feature modules  
**Test Framework:** Vitest  
**Package Manager:** pnpm
