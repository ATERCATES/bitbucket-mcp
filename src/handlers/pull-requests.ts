import { HandlerModule } from "./types.js";
import { BitbucketClient } from "../client.js";
import { PAGINATION_BASE_SCHEMA, PAGINATION_ALL_SCHEMA, LEGACY_LIMIT_SCHEMA } from "../schemas.js";
import { jsonResponse, textResponse } from "../utils.js";
import { logger } from "../logger.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { BITBUCKET_MAX_PAGELEN } from "../pagination.js";
import { BitbucketPullRequest } from "../types.js";

export const pullRequestsModule: HandlerModule = {
  tools: [
    {
      name: "getPullRequests",
      description: "Get pull requests for a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          state: {
            type: "string",
            enum: ["OPEN", "MERGED", "DECLINED", "SUPERSEDED"],
            description: "Pull request state",
          },
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
          limit: LEGACY_LIMIT_SCHEMA,
        },
        required: ["workspace", "repo_slug"],
      },
    },
    {
      name: "createPullRequest",
      description: "Create a new pull request",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          title: { type: "string", description: "Pull request title" },
          description: {
            type: "string",
            description: "Pull request description",
          },
          sourceBranch: {
            type: "string",
            description: "Source branch name",
          },
          targetBranch: {
            type: "string",
            description: "Target branch name",
          },
          reviewers: {
            type: "array",
            items: { type: "string" },
            description: "List of reviewer UUIDs (e.g., '{04776764-62c7-453b-b97e-302f60395ceb}')",
          },
          draft: {
            type: "boolean",
            description: "Whether to create the pull request as a draft",
          },
          close_source_branch: {
            type: "boolean",
            description: "Whether to close source branch after merge (default: true)",
          },
        },
        required: [
          "workspace",
          "repo_slug",
          "title",
          "description",
          "sourceBranch",
          "targetBranch",
        ],
      },
    },
    {
      name: "getPullRequest",
      description: "Get details for a specific pull request",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pull_request_id: {
            type: "string",
            description: "Pull request ID",
          },
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
        },
        required: ["workspace", "repo_slug", "pull_request_id"],
      },
    },
    {
      name: "updatePullRequest",
      description: "Update a pull request",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pull_request_id: {
            type: "string",
            description: "Pull request ID",
          },
          title: { type: "string", description: "New pull request title" },
          description: {
            type: "string",
            description: "New pull request description",
          },
          reviewers: {
            type: "array",
            items: { type: "string" },
            description: "List of reviewer UUIDs (e.g., '{04776764-62c7-453b-b97e-302f60395ceb}')",
          },
          destination: {
            type: "string",
            description: "New destination branch name",
          },
          close_source_branch: {
            type: "boolean",
            description: "Whether to close source branch after merge",
          },
          draft: {
            type: "boolean",
            description: "Whether the pull request is a draft",
          },
        },
        required: ["workspace", "repo_slug", "pull_request_id"],
      },
    },
    {
      name: "approvePullRequest",
      description: "Approve a pull request",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pull_request_id: {
            type: "string",
            description: "Pull request ID",
          },
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
        },
        required: ["workspace", "repo_slug", "pull_request_id"],
      },
    },
    {
      name: "unapprovePullRequest",
      description: "Remove approval from a pull request",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pull_request_id: {
            type: "string",
            description: "Pull request ID",
          },
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
        },
        required: ["workspace", "repo_slug", "pull_request_id"],
      },
    },
    {
      name: "declinePullRequest",
      description: "Decline a pull request",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pull_request_id: {
            type: "string",
            description: "Pull request ID",
          },
        },
        required: ["workspace", "repo_slug", "pull_request_id"],
      },
    },
    {
      name: "mergePullRequest",
      description: "Merge a pull request",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pull_request_id: {
            type: "string",
            description: "Pull request ID",
          },
          message: { type: "string", description: "Merge commit message" },
          merge_strategy: {
            type: "string",
            enum: [
              "merge_commit",
              "squash",
              "fast_forward",
              "squash_fast_forward",
              "rebase_fast_forward",
              "rebase_merge",
            ],
            description: "Merge strategy",
          },
          close_source_branch: {
            type: "boolean",
            description: "Whether to close the source branch after merge",
          },
        },
        required: ["workspace", "repo_slug", "pull_request_id"],
      },
    },
    {
      name: "createDraftPullRequest",
      description: "Create a new draft pull request",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          title: { type: "string", description: "Pull request title" },
          description: {
            type: "string",
            description: "Pull request description",
          },
          sourceBranch: {
            type: "string",
            description: "Source branch name",
          },
          targetBranch: {
            type: "string",
            description: "Target branch name",
          },
          reviewers: {
            type: "array",
            items: { type: "string" },
            description: "List of reviewer UUIDs (e.g., '{04776764-62c7-453b-b97e-302f60395ceb}')",
          },
        },
        required: [
          "workspace",
          "repo_slug",
          "title",
          "description",
          "sourceBranch",
          "targetBranch",
        ],
      },
    },
    {
      name: "publishDraftPullRequest",
      description: "Publish a draft pull request to make it ready for review",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pull_request_id: {
            type: "string",
            description: "Pull request ID",
          },
        },
        required: ["workspace", "repo_slug", "pull_request_id"],
      },
    },
    {
      name: "convertTodraft",
      description: "Convert a regular pull request to draft status",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pull_request_id: {
            type: "string",
            description: "Pull request ID",
          },
        },
        required: ["workspace", "repo_slug", "pull_request_id"],
      },
    },
    {
      name: "getPendingReviewPRs",
      description:
        "List all open pull requests in the workspace where the authenticated user is a reviewer and has not yet approved.",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name (optional, defaults to BITBUCKET_WORKSPACE)",
          },
          limit: {
            type: "number",
            description: "Maximum number of PRs to return (optional)",
          },
          repositoryList: {
            type: "array",
            items: { type: "string" },
            description: "List of repository slugs to check (optional)",
          },
        },
      },
    },
    {
      name: "requestChanges",
      description: "Request changes on a pull request",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          pull_request_id: { type: "string", description: "Pull request ID" },
        },
        required: ["workspace", "repo_slug", "pull_request_id"],
      },
    },
    {
      name: "removeRequestChanges",
      description: "Remove request changes from a pull request",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          pull_request_id: { type: "string", description: "Pull request ID" },
        },
        required: ["workspace", "repo_slug", "pull_request_id"],
      },
    },
  ],

  createHandlers: (client: BitbucketClient) => ({
    getPullRequests: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const state = args.state as "OPEN" | "MERGED" | "DECLINED" | "SUPERSEDED" | undefined;
      const pagelen = args.pagelen as number | undefined;
      const page = args.page as number | undefined;
      const all = args.all as boolean | undefined;
      const legacyLimit = args.limit as number | undefined;

      try {
        logger.info("Getting Bitbucket pull requests", {
          workspace,
          repo_slug,
          state,
          pagelen: pagelen ?? legacyLimit,
          page,
          all,
        });

        const params: Record<string, unknown> = {};
        if (state) {
          params.state = state;
        }

        const result = await client.paginator.fetchValues<BitbucketPullRequest>(
          `/repositories/${workspace}/${repo_slug}/pullrequests`,
          {
            pagelen: pagelen ?? legacyLimit,
            page,
            all,
            params,
            description: "getPullRequests",
          }
        );

        return jsonResponse(result.values);
      } catch (error) {
        logger.error("Error getting pull requests", {
          error,
          workspace,
          repo_slug,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull requests: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    createPullRequest: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const title = args.title as string;
      const description = args.description as string;
      const sourceBranch = args.sourceBranch as string;
      const targetBranch = args.targetBranch as string;
      const reviewers = args.reviewers as string[] | undefined;
      const draft = args.draft as boolean | undefined;
      const close_source_branch = args.close_source_branch as boolean | undefined;

      try {
        logger.info("Creating Bitbucket pull request", {
          workspace,
          repo_slug,
          title,
          sourceBranch,
          targetBranch,
        });

        // Prepare reviewers format if provided
        // Bitbucket API expects reviewers as array of objects: [{uuid: "{...}"}]
        // Input is string array of UUIDs: ["{04776764-62c7-453b-b97e-302f60395ceb}", ...]
        // Convert to API format: [{uuid: "{...}"}, ...]
        let reviewersArray: Array<{ uuid: string }> | undefined;

        if (reviewers && reviewers.length > 0) {
          reviewersArray = reviewers
            .filter((uuid) => typeof uuid === "string" && uuid.trim().length > 0)
            .map((uuid) => ({ uuid: uuid.trim() }));

          if (reviewersArray.length === 0) {
            reviewersArray = undefined;
          }
        }

        // Build request payload - only include reviewers if provided
        const requestPayload: Record<string, unknown> = {
          title,
          description,
          source: {
            branch: {
              name: sourceBranch,
            },
          },
          destination: {
            branch: {
              name: targetBranch,
            },
          },
          close_source_branch: close_source_branch ?? true,
        };

        // Only include reviewers field if there are reviewers to add
        if (reviewersArray && reviewersArray.length > 0) {
          requestPayload.reviewers = reviewersArray;
        }

        // Only include draft field if explicitly set to true
        if (draft === true) {
          requestPayload.draft = true;
        }

        // Create the pull request
        const response = await client.api.post(
          `/repositories/${workspace}/${repo_slug}/pullrequests`,
          requestPayload
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error creating pull request", {
          error,
          workspace,
          repo_slug,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to create pull request: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    getPullRequest: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;

      try {
        logger.info("Getting Bitbucket pull request details", {
          workspace,
          repo_slug,
          pull_request_id,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting pull request details", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull request details: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    updatePullRequest: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const title = args.title as string | undefined;
      const description = args.description as string | undefined;
      const reviewers = args.reviewers as string[] | undefined;
      const destination = args.destination as string | undefined;
      const close_source_branch = args.close_source_branch as boolean | undefined;
      const draft = args.draft as boolean | undefined;

      try {
        logger.info("Updating Bitbucket pull request", {
          workspace,
          repo_slug,
          pull_request_id,
        });

        // Only include fields that are provided
        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (reviewers !== undefined) {
          updateData.reviewers = reviewers
            .filter((uuid) => typeof uuid === "string" && uuid.trim().length > 0)
            .map((uuid) => ({ uuid: uuid.trim() }));
        }
        if (destination !== undefined) {
          updateData.destination = { branch: { name: destination } };
        }
        if (close_source_branch !== undefined) updateData.close_source_branch = close_source_branch;
        if (draft !== undefined) updateData.draft = draft;

        const response = await client.api.put(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}`,
          updateData
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error updating pull request", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to update pull request: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    approvePullRequest: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;

      try {
        logger.info("Approving Bitbucket pull request", {
          workspace,
          repo_slug,
          pull_request_id,
        });

        const response = await client.api.post(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/approve`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error approving pull request", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to approve pull request: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    unapprovePullRequest: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;

      try {
        logger.info("Unapproving Bitbucket pull request", {
          workspace,
          repo_slug,
          pull_request_id,
        });

        await client.api.delete(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/approve`
        );

        return textResponse("Pull request approval removed successfully.");
      } catch (error) {
        logger.error("Error unapproving pull request", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to unapprove pull request: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    declinePullRequest: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;

      try {
        logger.info("Declining Bitbucket pull request", {
          workspace,
          repo_slug,
          pull_request_id,
        });

        const response = await client.api.post(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/decline`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error declining pull request", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to decline pull request: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    mergePullRequest: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const message = args.message as string | undefined;
      const merge_strategy = args.merge_strategy as
        | "merge_commit"
        | "squash"
        | "fast_forward"
        | "squash_fast_forward"
        | "rebase_fast_forward"
        | "rebase_merge"
        | undefined;
      const close_source_branch = args.close_source_branch as boolean | undefined;

      try {
        logger.info("Merging Bitbucket pull request", {
          workspace,
          repo_slug,
          pull_request_id,
          merge_strategy,
        });

        // Build request data
        const data: Record<string, unknown> = {};
        if (message) data.message = message;
        if (merge_strategy) data.merge_strategy = merge_strategy;
        if (close_source_branch !== undefined) data.close_source_branch = close_source_branch;

        const response = await client.api.post(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/merge`,
          data
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error merging pull request", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to merge pull request: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    createDraftPullRequest: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const title = args.title as string;
      const description = args.description as string;
      const sourceBranch = args.sourceBranch as string;
      const targetBranch = args.targetBranch as string;
      const reviewers = args.reviewers as string[] | undefined;

      try {
        logger.info("Creating draft Bitbucket pull request", {
          workspace,
          repo_slug,
          title,
          sourceBranch,
          targetBranch,
        });

        // Prepare reviewers format if provided
        let reviewersArray: Array<{ uuid: string }> | undefined;

        if (reviewers && reviewers.length > 0) {
          reviewersArray = reviewers
            .filter((uuid) => typeof uuid === "string" && uuid.trim().length > 0)
            .map((uuid) => ({ uuid: uuid.trim() }));

          if (reviewersArray.length === 0) {
            reviewersArray = undefined;
          }
        }

        // Build request payload with draft=true
        const requestPayload: Record<string, unknown> = {
          title,
          description,
          source: {
            branch: {
              name: sourceBranch,
            },
          },
          destination: {
            branch: {
              name: targetBranch,
            },
          },
          close_source_branch: true,
          draft: true,
        };

        // Only include reviewers field if there are reviewers to add
        if (reviewersArray && reviewersArray.length > 0) {
          requestPayload.reviewers = reviewersArray;
        }

        // Create the draft pull request
        const response = await client.api.post(
          `/repositories/${workspace}/${repo_slug}/pullrequests`,
          requestPayload
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error creating draft pull request", {
          error,
          workspace,
          repo_slug,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to create draft pull request: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    publishDraftPullRequest: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;

      try {
        logger.info("Publishing draft pull request", {
          workspace,
          repo_slug,
          pull_request_id,
        });

        // Update the pull request to set draft=false
        const response = await client.api.put(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}`,
          {
            draft: false,
          }
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error publishing draft pull request", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to publish draft pull request: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    convertTodraft: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;

      try {
        logger.info("Converting pull request to draft", {
          workspace,
          repo_slug,
          pull_request_id,
        });

        // Update the pull request to set draft=true
        const response = await client.api.put(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}`,
          {
            draft: true,
          }
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error converting pull request to draft", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to convert pull request to draft: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getPendingReviewPRs: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string | undefined;
      const limit = (args.limit as number) || 50;
      const repositoryList = args.repositoryList as string[] | undefined;

      try {
        const wsName = client.resolveWorkspace(workspace);

        // Get current user's account_id from /user endpoint (works with both token and basic auth)
        const currentUserResponse = await client.api.get("/user");
        const currentUserAccountId = currentUserResponse.data.account_id;
        if (!currentUserAccountId) {
          throw new McpError(
            ErrorCode.InternalError,
            "Could not determine current user's account_id"
          );
        }

        logger.info("Getting pending review PRs", {
          workspace: wsName,
          account_id: currentUserAccountId,
          repositoryList: repositoryList?.length || "all repositories",
          limit,
        });

        let repositoriesToCheck: string[] = [];

        if (repositoryList && repositoryList.length > 0) {
          // Use the provided repository list
          repositoriesToCheck = repositoryList;
          logger.info(`Checking specific repositories: ${repositoryList.join(", ")}`);
        } else {
          // Get all repositories in the workspace (existing behavior)
          logger.info("Getting all repositories in workspace...");
          const reposResponse = await client.paginator.fetchValues(`/repositories/${wsName}`, {
            pagelen: BITBUCKET_MAX_PAGELEN,
            all: true,
            description: "getPendingReviewPRs.repositories",
          });

          if (!reposResponse.values) {
            throw new McpError(ErrorCode.InternalError, "Failed to fetch repositories");
          }

          repositoriesToCheck = reposResponse.values.map(
            (repo: unknown) => (repo as { name: string }).name
          );
          logger.info(`Found ${repositoriesToCheck.length} repositories to check`);
        }

        const pendingPRs: unknown[] = [];
        const batchSize = 5; // Process repositories in batches to avoid overwhelming the API

        // Process repositories in batches
        for (let i = 0; i < repositoriesToCheck.length; i += batchSize) {
          const batch = repositoriesToCheck.slice(i, i + batchSize);

          // Process batch in parallel
          const batchPromises = batch.map(async (repoSlug) => {
            try {
              logger.info(`Checking repository: ${repoSlug}`);

              // Get open PRs for this repository with participants expanded
              const prsResponse = await client.api.get(
                `/repositories/${wsName}/${repoSlug}/pullrequests`,
                {
                  params: {
                    state: "OPEN",
                    pagelen: Math.min(limit, 50), // Limit per repo to avoid too much data
                    fields:
                      "values.id,values.title,values.description,values.state,values.created_on,values.updated_on,values.author,values.source,values.destination,values.participants.user.account_id,values.participants.user.nickname,values.participants.role,values.participants.approved,values.links",
                  },
                }
              );

              if (!prsResponse.data.values) {
                return [];
              }

              // Filter PRs where current user is a reviewer and hasn't approved
              const reposPendingPRs = prsResponse.data.values.filter(
                (pr: {
                  id: number;
                  participants?: Array<{
                    user?: { account_id: string; nickname: string };
                    role: string;
                    approved: boolean;
                  }>;
                }) => {
                  if (!pr.participants || !Array.isArray(pr.participants)) {
                    logger.debug(`PR ${pr.id} has no participants array`);
                    return false;
                  }

                  logger.debug(
                    `PR ${pr.id} participants:`,
                    pr.participants.map((p) => ({
                      account_id: p.user?.account_id,
                      nickname: p.user?.nickname,
                      role: p.role,
                      approved: p.approved,
                    }))
                  );

                  // Check if current user is a reviewer who hasn't approved (using account_id)
                  const userParticipant = pr.participants.find(
                    (participant) =>
                      participant.user?.account_id === currentUserAccountId &&
                      participant.role === "REVIEWER" &&
                      participant.approved === false
                  );

                  logger.debug(
                    `PR ${pr.id} - User ${currentUserAccountId} is pending reviewer:`,
                    !!userParticipant
                  );

                  return !!userParticipant;
                }
              );

              // Add repository info to each PR
              return reposPendingPRs.map((pr: unknown) => ({
                ...(pr as object),
                repository: {
                  name: repoSlug,
                  full_name: `${wsName}/${repoSlug}`,
                },
              }));
            } catch (error) {
              logger.error(`Error checking repository ${repoSlug}:`, error);
              return [];
            }
          });

          // Wait for batch to complete
          const batchResults = await Promise.all(batchPromises);

          // Flatten and add to results
          for (const repoPRs of batchResults) {
            pendingPRs.push(...repoPRs);

            // Stop if we've reached the limit
            if (pendingPRs.length >= limit) {
              break;
            }
          }

          // Stop processing if we've reached the limit
          if (pendingPRs.length >= limit) {
            break;
          }
        }

        // Trim to exact limit and sort by updated date
        const finalResults = pendingPRs
          .slice(0, limit)
          .sort(
            (a, b) =>
              new Date((b as { updated_on: string }).updated_on).getTime() -
              new Date((a as { updated_on: string }).updated_on).getTime()
          );

        logger.info(`Found ${finalResults.length} pending review PRs`);

        return jsonResponse({
          pending_review_prs: finalResults,
          total_found: finalResults.length,
          searched_repositories: repositoriesToCheck.length,
          user_account_id: currentUserAccountId,
          workspace: wsName,
        });
      } catch (error) {
        logger.error("Error getting pending review PRs:", error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pending review PRs: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    requestChanges: async (args: Record<string, unknown>) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;

      logger.info(`Requesting changes on PR #${pull_request_id} in ${workspace}/${repo_slug}`);

      await client.api.post(
        `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/request-changes`
      );
      return jsonResponse({ success: true });
    },

    removeRequestChanges: async (args: Record<string, unknown>) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;

      logger.info(
        `Removing request changes from PR #${pull_request_id} in ${workspace}/${repo_slug}`
      );

      await client.api.delete(
        `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/request-changes`
      );
      return jsonResponse({ success: true });
    },
  }),
};
