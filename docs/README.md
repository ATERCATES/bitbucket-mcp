# Bitbucket MCP Server Documentation

Welcome to the Bitbucket MCP (Model Context Protocol) Server documentation. This server provides AI assistants and other MCP clients with programmatic access to Bitbucket Cloud and Server APIs.

## Quick Links

- **[Getting Started Guide](guides/GETTING_STARTED.md)** - Installation and configuration
- **[Tools Reference](TOOLS.md)** - Complete list of all available tools
- **[Architecture](architecture/ARCHITECTURE.md)** - Technical design and structure
- **[Project Structure](guides/PROJECT_STRUCTURE.md)** - Explanation of files and directories
- **[Environment Variables](guides/ENVIRONMENT_VARIABLES.md)** - Configuration reference
- **[NPM Deployment](guides/NPM_DEPLOYMENT.md)** - Publishing to NPM

## What is Bitbucket MCP?

The Bitbucket MCP server is a standardized interface that allows AI assistants (like Claude, integrated in Cursor) to interact with Bitbucket repositories programmatically. It enables:

- **Repository Management**: List, create, and manage repositories
- **Pull Request Operations**: Create, approve, merge, and manage PRs
- **Code Review**: Add comments, tasks, and request changes on PRs
- **Branch Management**: Create, list, and delete branches and tags
- **Pipeline Control**: Trigger and monitor CI/CD pipelines
- **Source Code Access**: Read file content from repositories
- **Commit History**: Query commits and changes

## Key Features

✨ **Modular Architecture** - Organized by feature domain for easy maintenance and extension

🔒 **Secure** - Token-based authentication with fine-grained permission control

📝 **Well-Documented** - Comprehensive API reference and architecture guide

🧪 **Tested** - Full unit test suite with 100% tool coverage

⚡ **Fast** - Efficient pagination and minimal dependencies

🛡️ **Safe** - Dangerous operations (deletes) require explicit enablement

## Quick Start

1. **Install:**
   ```bash
   npm install -g bitbucket-mcp
   # or
   npx -y bitbucket-mcp@latest
   ```

2. **Configure:**
   ```bash
   export BITBUCKET_TOKEN="your_app_password"
   export BITBUCKET_WORKSPACE="my-workspace"
   ```

3. **Run:**
   ```bash
   bitbucket-mcp
   ```

4. **Connect:** Configure your MCP client (Claude, Cursor) to use this server

For detailed setup instructions, see [Getting Started Guide](guides/GETTING_STARTED.md).

## Core Concepts

### MCP (Model Context Protocol)

MCP is a standardized protocol that allows AI models to interact with external tools and data sources. This server implements the MCP specification to expose Bitbucket operations as "tools" that AI assistants can call.

### Handler Modules

The server is organized into feature-based handler modules:

| Module | Purpose |
|--------|---------|
| `repositories` | Repository operations |
| `pull-requests` | PR creation, approval, merging |
| `pr-comments` | PR comments and discussions |
| `pr-tasks` | PR tasks (TODO items) |
| `pr-content` | PR diffs and commits |
| `refs` | Branches and tags |
| `commits` | Commit history and details |
| `pipelines` | CI/CD pipeline management |
| `source` | Source code file access |
| `users` | User and workspace information |
| `branching-model` | Branching strategy configuration |

### Authentication

The server supports two authentication methods:

1. **Token Authentication** (Recommended)
   ```bash
   BITBUCKET_TOKEN=your_app_password
   ```

2. **Basic Authentication**
   ```bash
   BITBUCKET_USERNAME=your_email@example.com
   BITBUCKET_PASSWORD=your_app_password
   ```

### Workspace Resolution

Workspaces can be specified in multiple ways:

1. **Default workspace** (via `BITBUCKET_WORKSPACE` env var)
2. **Per-call** (via `workspace` parameter in tool arguments)
3. **Auto-detection** (from API responses)

## Available Tools

The server exposes 59 tools across 11 categories. See [TOOLS.md](TOOLS.md) for complete reference.

**Quick Examples:**

- `listRepositories` - List repos in a workspace
- `createPullRequest` - Create a new PR
- `approvePullRequest` - Approve a PR
- `mergePullRequest` - Merge a PR
- `listBranches` - List repository branches
- `runPipeline` - Trigger a pipeline run
- `getFileContent` - Read file from repository

## Architecture Overview

```
┌─────────────────────────────────────────┐
│     MCP Client (Cursor, Claude, etc)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│   Bitbucket MCP Server                  │
├──────────────────────────────────────────┤
│  • Tool Registration                     │
│  • Request Routing                       │
│  • Authentication                        │
└──────────────┬───────────────────────────┘
               │
        ┌──────▼──────────────────────────┐
        │   Handler Modules               │
        │   (repositories, PRs, etc)      │
        └──────┬───────────────────────────┘
               │
    ┌──────────┴──────────────┐
    ▼                         ▼
┌──────────────────┐  ┌──────────────────┐
│ BitbucketClient  │  │    Logger        │
│ (API Wrapper)    │  │ (File-based)     │
└────────┬─────────┘  └──────────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Bitbucket API   │
    │ (Cloud/Server)  │
    └─────────────────┘
```

For more details, see [Architecture](architecture/ARCHITECTURE.md).

## Environment Variables

### Required

- `BITBUCKET_TOKEN` - App password for authentication (recommended)
- OR `BITBUCKET_USERNAME` + `BITBUCKET_PASSWORD` - Basic auth credentials

### Optional

- `BITBUCKET_URL` - API base URL (default: `https://api.bitbucket.org/2.0`)
- `BITBUCKET_WORKSPACE` - Default workspace name
- `BITBUCKET_ALLOW_DANGEROUS` - Enable delete operations (default: false)
- `BITBUCKET_LOG_DISABLE` - Disable file logging (default: false)
- `BITBUCKET_LOG_FILE` - Custom log file path
- `BITBUCKET_LOG_DIR` - Custom log directory
- `BITBUCKET_LOG_PER_CWD` - Create per-directory logs (default: false)

## Getting Help

- 📖 Check [TOOLS.md](TOOLS.md) for tool-specific documentation
- 🏗️ Review [Architecture](architecture/ARCHITECTURE.md) for technical details
- 📁 See [Project Structure](guides/PROJECT_STRUCTURE.md) for file organization
- 🚀 See [Getting Started](guides/GETTING_STARTED.md) for setup help
- ⚙️ Check [Environment Variables](guides/ENVIRONMENT_VARIABLES.md) for config options
- 📦 See [NPM Deployment](guides/NPM_DEPLOYMENT.md) for publishing
- 🐛 Check logs in your platform's log directory (see Getting Started guide)

## Contributing

Contributions are welcome! To add new features:

1. Create a new handler module in `src/handlers/`
2. Implement the `HandlerModule` interface
3. Register it in `src/handlers/index.ts`
4. Add tests in `__tests__/handlers/`
5. Submit a pull request

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License - See LICENSE file for details.

## Support

- Report issues on GitHub
- Check existing issues for solutions
- Review logs for error details (enable with `BITBUCKET_LOG_DISABLE=false`)

---

**Last Updated:** 2024
**Version:** 5.0.0+
