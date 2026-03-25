# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides AI assistants with programmatic access to Bitbucket Cloud and Server APIs. It's published as an npm package (`@atercates/bitbucket-mcp`) and enables operations on repositories, pull requests, pipelines, and more through a standardized MCP interface.

**Safety First**: Dangerous operations (deletes) require explicit `BITBUCKET_ALLOW_DANGEROUS=true`. Every PR is analyzed with CodeQL for security.

## Development Commands

### Build and Run
```bash
pnpm install         # Install dependencies
pnpm build           # Compile TypeScript to dist/ (also sets executable permission)
pnpm start           # Run compiled server from dist/index.js
pnpm dev             # Run in development mode with watch (uses tsx)
```

### Testing and Quality
```bash
pnpm test            # Run Vitest tests
pnpm test:watch      # Run Vitest in watch mode
pnpm lint            # Run ESLint on src/
pnpm lint:fix        # Auto-fix ESLint issues
pnpm format          # Format with Prettier
pnpm format:check    # Check formatting
```

### MCP Inspector
```bash
pnpm inspector       # Launch MCP inspector for debugging tools
```

### Publishing
```bash
pnpm publish:patch   # Bump patch version and publish
pnpm publish:minor   # Bump minor version and publish
pnpm publish:major   # Bump major version and publish
pnpm release         # Alias for publish:patch
```

## Architecture

### Modular Handler-Based Design
The server is organized into feature-based handler modules:

```
src/
├─ index.ts              # Entry point
├─ server.ts             # MCP server orchestration
├─ client.ts             # Bitbucket API client (axios + paginator)
├─ config.ts             # Environment config + URL normalization
├─ logger.ts             # Winston file-based logging
├─ types.ts              # TypeScript interfaces
├─ schemas.ts            # Shared pagination schemas
├─ utils.ts              # Response helpers
├─ pagination.ts         # Pagination helper
└─ handlers/             # Feature modules
   ├─ repositories.ts
   ├─ pull-requests.ts
   ├─ pr-comments.ts
   ├─ pr-tasks.ts
   ├─ pr-content.ts
   ├─ refs.ts            # Branches and tags
   ├─ commits.ts
   ├─ pipelines.ts
   ├─ source.ts
   ├─ users.ts
   ├─ branching-model.ts
   └─ index.ts           # Aggregates all modules
```

### Core Components

**BitbucketClient** (`src/client.ts`): Axios-based HTTP client with:
- Token or basic auth authentication
- URL normalization (web URLs → API URLs)
- Workspace resolution helper

**BitbucketMcpServer** (`src/server.ts`): MCP server that:
- Iterates all handler modules and registers tools + handlers
- Routes tool calls via a `Map<string, ToolHandler>` lookup
- Filters dangerous tools based on config
- Wraps Axios errors as McpError

**Handler Modules** (`src/handlers/`): Each module exports:
- `tools: ToolDefinition[]` — tool schemas
- `createHandlers(client): Record<string, ToolHandler>` — handler implementations
- `dangerousTools?: string[]` — tools requiring explicit opt-in

### Environment Configuration
- `BITBUCKET_URL`: API base URL (defaults to https://api.bitbucket.org/2.0)
- `BITBUCKET_TOKEN` OR `BITBUCKET_USERNAME` + `BITBUCKET_PASSWORD`: Authentication
- `BITBUCKET_WORKSPACE`: Default workspace (auto-extracted from URL if not provided)
- `BITBUCKET_ALLOW_DANGEROUS`: Enable destructive operations (disabled by default)
- `BITBUCKET_LOG_*`: Logging configuration (file, directory, disable, per-CWD)

### Logging
Uses Winston with file-based logging to OS-specific directories:
- macOS: `~/Library/Logs/bitbucket-mcp/`
- Windows: `%LOCALAPPDATA%/bitbucket-mcp/`
- Linux: `~/.local/state/bitbucket-mcp/` or `$XDG_STATE_HOME/bitbucket-mcp/`

### URL Normalization Logic
`normalizeBitbucketConfig()` handles backward compatibility:
- Converts `https://bitbucket.org/<workspace>` → `https://api.bitbucket.org/2.0` (auto-extracts workspace)
- Ensures `https://api.bitbucket.org` always has `/2.0` suffix
- Removes trailing slashes for consistent axios baseURL

## Build System

- **TypeScript**: ES2020 with strict mode, compiled to `dist/`
- **Module System**: ESM (type: "module", moduleResolution: NodeNext)
- **Entry Point**: `dist/index.js` (has shebang for CLI usage)
- **Bin**: Package exposes `bitbucket-mcp` command globally
- **Package Manager**: pnpm
- **Linting**: ESLint with typescript-eslint (flat config)
- **Formatting**: Prettier
- **Testing**: Vitest

## Integration

Designed to be used via:
1. **NPX**: `npx -y @atercates/bitbucket-mcp@latest` (recommended)
2. **Global install**: `pnpm add -g @atercates/bitbucket-mcp`
3. **Project install**: Add to MCP client config
4. **Docker**: Dockerfile provided for containerized deployment

MCP clients (like Cursor, Claude) communicate via stdio transport.
