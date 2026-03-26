# Architecture Overview

This document describes the architecture of the Bitbucket MCP server.

## High-Level Overview

The Bitbucket MCP server is a Model Context Protocol (MCP) implementation that provides programmatic access to Bitbucket Cloud and Server APIs. It's designed as a modular, maintainable system that separates concerns by feature domain.

```
┌─────────────────────────────────────────┐
│     MCP Client (e.g., Cursor, Claude)   │
└──────────────┬──────────────────────────┘
               │ stdio/HTTP
               ▼
┌──────────────────────────────────────────┐
│   BitbucketMcpServer (src/server.ts)    │
│  - Tool Registration                     │
│  - Request Routing                       │
│  - MCP Protocol Handling                 │
└──────────────┬───────────────────────────┘
               │
        ┌──────▼──────────────────────────┐
        │   Handler Modules (/handlers/)  │
        ├─────────────────────────────────┤
        │ • repositories.ts               │
        │ • pull-requests.ts              │
        │ • pr-comments.ts                │
        │ • pr-tasks.ts                   │
        │ • pr-content.ts                 │
        │ • pipelines.ts                  │
        │ • refs.ts (branches/tags)       │
        │ • commits.ts                    │
        │ • source.ts                     │
        │ • users.ts                      │
        │ • branching-model.ts            │
        └──────┬───────────────────────────┘
               │
    ┌──────────┴──────────────┐
    ▼                         ▼
┌──────────────────┐  ┌──────────────────┐
│ BitbucketClient  │  │    Logger        │
│ (src/client.ts)  │  │ (src/logger.ts)  │
│                  │  │                  │
│ • API wrapper    │  │ • File-based     │
│ • Auth handling  │  │   logging        │
│ • URL normaliz.  │  │ • Platform-aware │
│ • Pagination    │  │                  │
└────────┬─────────┘  └──────────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Bitbucket API   │
    │ (api.bitbucket) │
    └─────────────────┘
```

## Core Components

### 1. Entry Point (`src/index.ts`)
- Minimal entry point that initializes the server
- Starts stdio transport for MCP communication
- Handles process lifecycle

### 2. Server (`src/server.ts`)
The core orchestrator that:
- Manages MCP protocol events
- Dynamically registers tools from handler modules
- Routes tool calls to appropriate handlers
- Handles errors and response formatting

**Key Responsibilities:**
- `initializeListTools()`: Collects tools from all modules
- `handleCallTool()`: Routes calls to correct handler
- Security checks for dangerous tools

### 3. Handler Modules (`src/handlers/`)
Each handler module follows the `HandlerModule` interface:

```typescript
interface HandlerModule {
  tools: Tool[];
  dangerousTools?: string[];
  createHandlers: (client: BitbucketClient) => Record<string, Handler>;
}
```

**Module Pattern:**
- **tools**: Defines tool schemas (names, descriptions, input schemas)
- **dangerousTools**: Lists tools requiring `BITBUCKET_ALLOW_DANGEROUS`
- **createHandlers**: Factory function that returns handler implementations

**Example Structure:**
```
repositories.ts
  └─ tools: [
       { name: "listRepositories", ... },
       { name: "getRepository", ... },
       { name: "createRepository", ... }
     ]
  └─ createHandlers: (client) => ({
       listRepositories: async (args) => { ... },
       getRepository: async (args) => { ... },
       createRepository: async (args) => { ... }
     })
```

### 4. BitbucketClient (`src/client.ts`)
Encapsulates all Bitbucket API interactions:

**Key Features:**
- **Authentication**: Supports token or username/password auth
- **URL Normalization**: Converts web URLs to API URLs
- **HTTP Client**: Axios instance with proper headers
- **Pagination**: Built-in paginator for large datasets
- **Error Handling**: Consistent error messages

**Methods:**
- `resolveWorkspace()`: Gets workspace from cache or args
- `api`: Direct Axios access for API calls
- `paginator`: Pagination helper

### 5. Configuration (`src/config.ts`)
Centralized environment variable management:

**Environment Variables:**
- `BITBUCKET_URL`: API base URL (default: https://api.bitbucket.org/2.0)
- `BITBUCKET_API_TOKEN`: Workspace/Repository Access Token (Bearer Auth) or API Token (Basic Auth) (Recommended)
- `BITBUCKET_USERNAME`: For Legacy App Password / Basic Auth
- `BITBUCKET_PASSWORD`: For Legacy App Password / Basic Auth
- `BITBUCKET_WORKSPACE`: Default workspace
- `BITBUCKET_ALLOW_DANGEROUS`: Enable dangerous operations
- `BITBUCKET_LOG_*`: Logging configuration

### 6. Logger (`src/logger.ts`)
File-based logging using Winston:

**Features:**
- Platform-aware log directory selection
- Structured JSON logging
- Per-CWD logging option
- Disableable via environment variable

**Log Locations:**
- macOS: `~/Library/Logs/bitbucket-mcp/`
- Windows: `%LOCALAPPDATA%/bitbucket-mcp/`
- Linux: `~/.local/state/bitbucket-mcp/` or `$XDG_STATE_HOME/bitbucket-mcp/`

### 7. Utilities (`src/utils.ts`)
Response formatting helpers:

- `jsonResponse()`: Wrap JSON in MCP response format
- `textResponse()`: Wrap text in MCP response format

### 8. Types (`src/types.ts`)
Complete TypeScript definitions for:
- Bitbucket API entities
- MCP request/response types
- Handler function signatures

### 9. Schemas (`src/schemas.ts`)
JSON Schema definitions for tool inputs:
- Pagination parameters
- Common field definitions
- Reusable schema fragments

### 10. Pagination (`src/pagination.ts`)
BitbucketPaginator class for handling paginated API responses:

**Features:**
- Automatic pagination following `next` links
- Configurable page size limits
- All-items mode with safety caps

## Data Flow

### Typical Request Flow

```
1. Client calls tool via MCP
   Example: { name: "listRepositories", arguments: { workspace: "my-ws" } }

2. MCP Server receives request in server.ts
   └─ handleCallTool() method

3. Server routes to handler module
   └─ Finds correct handler in pull-requests.ts, repositories.ts, etc.

4. Handler extracts parameters and validates
   └─ Resolves workspace from config/args

5. Handler calls BitbucketClient
   └─ client.api.get() or client.paginator.fetchValues()

6. BitbucketClient hits Bitbucket API
   └─ With proper auth headers and error handling

7. Response is formatted
   └─ JSON or text response wrapping

8. MCP Server sends back to client
   └─ { content: [{ type: "text", text: "..." }] }
```

## Security

### Dangerous Tools Gating

Some operations (delete, remove) are marked dangerous and require explicit enablement:

```typescript
// In handler module
dangerousTools: ["deleteBranch", "deleteTag"]

// In server.ts - gates execution
if (isDangerous && !isDangerousAllowed) {
  throw error("BITBUCKET_ALLOW_DANGEROUS not set");
}
```

### Authentication

Supported methods (checked in order):
1. **API/Access Token**: `BITBUCKET_API_TOKEN` (Uses Bearer Auth by default, or Basic Auth if `BITBUCKET_USERNAME` is provided)
2. **App Password**: `BITBUCKET_USERNAME` + `BITBUCKET_PASSWORD` (Basic Auth, Legacy)
3. **OAuth**: `BITBUCKET_TOKEN` (Bearer token)

Both are passed to Axios as Authorization headers.

## Testing

The project uses Vitest with:
- Mock BitbucketClient for unit tests
- Mock Axios instance
- Handler-by-handler tests
- Edge case coverage

**Test Structure:**
```
__tests__/
  ├─ test-utils.ts         (Mock helpers)
  └─ handlers/
     ├─ repositories.test.ts
     ├─ pull-requests.test.ts
     └─ ... (one per handler)
```

## Build System

- **TypeScript**: Compiles to ES2020 with strict mode
- **Module System**: ESM (type: "module")
- **Entry Point**: `dist/index.js` (executable with shebang)
- **Linting**: ESLint with flat config
- **Formatting**: Prettier
- **Testing**: Vitest

## Extension Pattern

To add new functionality:

1. **Create a handler module** `src/handlers/new-feature.ts`:
   ```typescript
   export const newFeatureModule: HandlerModule = {
     tools: [{ name: "...", ... }],
     createHandlers: (client) => ({
       toolName: async (args) => { ... }
     })
   };
   ```

2. **Register in** `src/handlers/index.ts`:
   ```typescript
   export const allModules = [
     repositoriesModule,
     newFeatureModule, // Add here
     // ...
   ];
   ```

3. **The server will automatically pick it up** - no additional wiring needed!

## Performance Considerations

- **Pagination**: Large datasets are paginated by default (100 items/page max)
- **Lazy Loading**: Handlers only loaded when server starts
- **Streaming**: Responses returned as-is without buffering
- **Caching**: Workspace resolution cached per session

## Error Handling

All handlers use consistent error handling:

```typescript
try {
  // API call
  return jsonResponse(data);
} catch (error) {
  logger.error("Operation failed", { error, context });
  throw new McpError(
    ErrorCode.InternalError,
    `Descriptive message: ${error.message}`
  );
}
```
