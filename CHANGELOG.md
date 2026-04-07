# Changelog

## Unreleased

### Added
- **Operation Modes**: New `BITBUCKET_MODE` environment variable with 3 modes:
  - `readonly`: Only GET operations (safe for production analysis)
  - `safe`: GET + POST/PUT, no deletes (default)
  - `full`: All operations including dangerous deletes
- **Fine-grained Tool Control**: New environment variables for precise tool filtering:
  - `BITBUCKET_ENABLED_TOOLS`: Whitelist specific tools (comma-separated)
  - `BITBUCKET_DISABLED_TOOLS`: Blacklist specific tools (comma-separated)

### Fixed
- **getPullRequestDiff**: Fixed 404 error by adding `beforeRedirect` hook to preserve authentication when axios follows the 302 redirect from `/pullrequests/{id}/diff` endpoint

### Changed
- Tool filtering now respects operation modes and custom tool lists
- Server logs now include the active mode on startup

### Documentation
- Updated README with operation modes and tool control examples
- Added configuration examples for readonly, safe, and full modes
- Documented fine-grained tool control with ENABLED_TOOLS and DISABLED_TOOLS

## Previous

- Added a shared Bitbucket Cloud pagination helper and applied it across all list-style MCP tools so `pagelen`, `page`, and `all` arguments respect Bitbucket limits and `next` links (#37).
- Updated tool schemas, README documentation, and logging to describe the new pagination controls and to highlight the 1,000-item safety cap for `all=true`.
- Added Jest tests covering the pagination helper, including explicit `pagelen` requests, maximum page sizing, and automatic traversal of `next` links.
