# Bitbucket MCP Tools Reference

Complete list of all available tools provided by the Bitbucket MCP server, organized by category.

## Table of Contents

- [Repositories](#repositories)
- [Pull Requests](#pull-requests)
- [PR Comments](#pr-comments)
- [PR Tasks](#pr-tasks)
- [PR Content](#pr-content)
- [Branches & Tags (Refs)](#branches--tags-refs)
- [Commits](#commits)
- [Pipelines](#pipelines)
- [Source Code](#source-code)
- [Users & Workspaces](#users--workspaces)
- [Branching Model](#branching-model)

---

## Repositories

Manage repositories in Bitbucket workspaces.

### listRepositories
List all repositories in a workspace.

**Parameters:**
- `workspace` (string, required): Bitbucket workspace name
- `pagelen` (number): Page length (1-100, default 10)
- `page` (number): Page number
- `all` (boolean): Fetch all results (default false)

**Example:**
```
workspace: "my-workspace"
pagelen: 20
```

### getRepository
Get details for a specific repository.

**Parameters:**
- `workspace` (string, required): Bitbucket workspace name
- `repo_slug` (string, required): Repository slug

### createRepository
Create a new repository.

**Parameters:**
- `workspace` (string, required): Bitbucket workspace name
- `name` (string, required): Repository name
- `description` (string): Repository description
- `is_private` (boolean): Private repository (default true)

---

## Pull Requests

Work with pull requests in repositories.

### getPullRequests
List pull requests for a repository.

**Parameters:**
- `workspace` (string, required): Bitbucket workspace name
- `repo_slug` (string, required): Repository slug
- `state` (string): Filter by state (OPEN, MERGED, DECLINED, SUPERSEDED)
- `pagelen` (number): Page length (1-100, default 10)

### getPullRequest
Get details for a specific pull request.

**Parameters:**
- `workspace` (string, required): Bitbucket workspace name
- `repo_slug` (string, required): Repository slug
- `pull_request_id` (string, required): Pull request ID

### createPullRequest
Create a new pull request.

**Parameters:**
- `workspace` (string, required): Bitbucket workspace name
- `repo_slug` (string, required): Repository slug
- `title` (string, required): PR title
- `description` (string, required): PR description
- `sourceBranch` (string, required): Source branch name
- `targetBranch` (string, required): Target branch name
- `reviewers` (array): List of reviewer UUIDs
- `draft` (boolean): Create as draft
- `close_source_branch` (boolean): Close source branch after merge (default true)

### updatePullRequest
Update an existing pull request.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)
- `title` (string): New title
- `description` (string): New description
- `reviewers` (array): Updated reviewer list
- `close_source_branch` (boolean): Close branch on merge

### approvePullRequest
Approve a pull request.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)

### declinePullRequest
Decline a pull request.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)

### mergePullRequest
Merge a pull request.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)
- `message` (string): Merge commit message
- `strategy` (string): Merge strategy (merge_commit, squash, fast_forward)
- `close_source_branch` (boolean): Close source branch after merge

### requestChanges
Request changes on a pull request.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)

---

## PR Comments

Manage comments on pull requests.

### getPullRequestComments
Get comments on a pull request.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)
- `pagelen` (number): Page length
- `page` (number): Page number

### createPullRequestComment
Create a comment on a pull request.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)
- `content` (string, required): Comment text
- `path` (string): File path for inline comment
- `to` (number): Line number in new version (for inline comments)
- `from` (number): Line number in old version (for inline comments)

### deletePullRequestComment
Delete a PR comment (DANGEROUS).

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)
- `comment_id` (string, required)

---

## PR Tasks

Manage PR tasks (TODO items).

### getPullRequestTasks
Get tasks on a pull request.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)

### createPullRequestTask
Create a task on a pull request.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)
- `content` (string, required): Task description

### updatePullRequestTask
Update a PR task.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)
- `task_id` (string, required)
- `state` (string): Task state (RESOLVED or UNRESOLVED)

### deletePullRequestTask
Delete a PR task (DANGEROUS).

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)
- `task_id` (string, required)

---

## PR Content

Get detailed content from pull requests.

### getPullRequestDiff
Get the diff for a pull request.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)

**Returns:** Unified diff format

### getPullRequestCommits
Get all commits in a pull request.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pull_request_id` (string, required)

---

## Branches & Tags (Refs)

Manage repository branches and tags.

### listBranches
List all branches in a repository.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `q` (string): Query filter
- `pagelen` (number): Page length
- `page` (number): Page number
- `all` (boolean): Fetch all

### createBranch
Create a new branch.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `name` (string, required): Branch name
- `target` (object, required): `{ hash: "commit-hash" }`

### getBranch
Get a specific branch.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `name` (string, required): Branch name

### deleteBranch
Delete a branch (DANGEROUS).

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `name` (string, required): Branch name

### listTags
List all tags in a repository.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `q` (string): Query filter
- `pagelen` (number): Page length
- `page` (number): Page number

### createTag
Create a new tag.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `name` (string, required): Tag name
- `target` (object, required): `{ hash: "commit-hash" }`
- `message` (string): Tag message

### getTag
Get a specific tag.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `name` (string, required): Tag name

### deleteTag
Delete a tag (DANGEROUS).

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `name` (string, required): Tag name

---

## Commits

Work with repository commits.

### listCommits
List commits in a repository or branch.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `branch` (string): Branch name
- `include` (string): Include refs
- `exclude` (string): Exclude refs
- `pagelen` (number): Page length
- `page` (number): Page number
- `all` (boolean): Fetch all

### getCommit
Get details for a specific commit.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `sha` (string, required): Commit SHA

---

## Pipelines

Manage Bitbucket Pipelines.

### listPipelineRuns
List pipeline runs for a repository.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `status` (string): Filter by status (PENDING, IN_PROGRESS, SUCCESSFUL, FAILED, ERROR, STOPPED)
- `target_branch` (string): Filter by target branch
- `trigger_type` (string): Filter by trigger type (manual, push, pullrequest, schedule)
- `pagelen` (number): Page length
- `page` (number): Page number

### getPipelineRun
Get details for a specific pipeline run.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pipeline_uuid` (string, required): Pipeline UUID

### runPipeline
Trigger a new pipeline run.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `target` (object, required): Target configuration
  - `ref_type` (string, required): "branch", "tag", "bookmark", "named_branch"
  - `ref_name` (string, required): Reference name
  - `commit_hash` (string): Specific commit hash
  - `selector_type` (string): "default", "custom", "branches", "tags", "bookmarks"
  - `selector_pattern` (string): Pipeline selector pattern
- `variables` (array): Pipeline variables

### stopPipeline
Stop a running pipeline.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `pipeline_uuid` (string, required): Pipeline UUID

---

## Source Code

Access repository source code.

### getFileContent
Get the content of a file from a repository.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)
- `path` (string, required): File path
- `commit` (string): Commit SHA, branch, or tag (default: main branch)

**Returns:** File content as text

---

## Users & Workspaces

Manage users and workspace information.

### getCurrentUser
Get details of the authenticated user.

**Returns:** User information including email, username, etc.

### listWorkspaces
List all workspaces for the authenticated user.

**Returns:** List of accessible workspaces

---

## Branching Model

Get repository branching model configuration.

### getRepositoryBranchingModel
Get the branching model for a repository.

**Parameters:**
- `workspace` (string, required)
- `repo_slug` (string, required)

**Returns:** Branching model configuration (branch types for development, production, etc.)

### getProjectBranchingModel
Get the branching model for a project.

**Parameters:**
- `workspace` (string, required)
- `project_key` (string, required): Project key

**Returns:** Project branching model configuration

---

## Dangerous Tools

The following tools are marked as dangerous and require `BITBUCKET_MODE=full` to use:

- `deletePullRequestComment`
- `deletePullRequestTask`
- `deleteBranch`
- `deleteTag`

These operations cannot be undone and should be used with caution.

**Operation Modes:**
- `readonly`: Only GET operations allowed
- `safe`: GET + POST/PUT, but no deletes (default)
- `full`: All operations including dangerous deletes
