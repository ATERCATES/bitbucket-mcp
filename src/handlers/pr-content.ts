import { HandlerModule } from "./types.js";
import { BitbucketClient } from "../client.js";
import { PAGINATION_BASE_SCHEMA, PAGINATION_ALL_SCHEMA } from "../schemas.js";
import { jsonResponse, textResponse } from "../utils.js";
import { logger } from "../logger.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

export const prContentModule: HandlerModule = {
  tools: [
    {
      name: "getPullRequestDiff",
      description: "Get diff for a pull request",
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
      name: "getPullRequestDiffStat",
      description: "Get diff statistics for a pull request",
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
      name: "getPullRequestPatch",
      description: "Get patch for a pull request",
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
      name: "getPullRequestCommits",
      description: "Get commits on a pull request",
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
      name: "getPullRequestActivity",
      description: "Get activity log for a pull request",
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
      name: "getPullRequestStatuses",
      description: "List commit statuses associated with a pull request",
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
  ],

  createHandlers: (client: BitbucketClient) => ({
    getPullRequestDiff: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;

      try {
        logger.info("Getting Bitbucket pull request diff", {
          workspace,
          repo_slug,
          pull_request_id,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/diff`,
          {
            headers: { Accept: "text/plain" },
            responseType: "text",
            maxRedirects: 5,
          }
        );

        return textResponse(response.data);
      } catch (error) {
        logger.error("Error getting pull request diff", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull request diff: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getPullRequestDiffStat: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const pagelen = args.pagelen as number | undefined;
      const page = args.page as number | undefined;
      const all = args.all as boolean | undefined;

      try {
        logger.info("Getting pull request diffstat", {
          workspace,
          repo_slug,
          pull_request_id,
          pagelen,
          page,
          all,
        });

        const result = await client.paginator.fetchValues(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/diffstat`,
          {
            pagelen,
            page,
            all,
            description: "getPullRequestDiffStat",
          }
        );

        return jsonResponse(result.values);
      } catch (error) {
        logger.error("Error getting pull request diffstat", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull request diffstat: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getPullRequestPatch: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;

      try {
        logger.info("Getting pull request patch", {
          workspace,
          repo_slug,
          pull_request_id,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/patch`,
          {
            headers: { Accept: "text/plain" },
            responseType: "text",
            maxRedirects: 5,
          }
        );

        return textResponse(response.data);
      } catch (error) {
        logger.error("Error getting pull request patch", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull request patch: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getPullRequestCommits: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const pagelen = args.pagelen as number | undefined;
      const page = args.page as number | undefined;
      const all = args.all as boolean | undefined;

      try {
        logger.info("Getting Bitbucket pull request commits", {
          workspace,
          repo_slug,
          pull_request_id,
          pagelen,
          page,
          all,
        });

        const result = await client.paginator.fetchValues(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/commits`,
          {
            pagelen,
            page,
            all,
            description: "getPullRequestCommits",
          }
        );

        return jsonResponse(result.values);
      } catch (error) {
        logger.error("Error getting pull request commits", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull request commits: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getPullRequestActivity: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const pagelen = args.pagelen as number | undefined;
      const page = args.page as number | undefined;
      const all = args.all as boolean | undefined;

      try {
        logger.info("Getting Bitbucket pull request activity", {
          workspace,
          repo_slug,
          pull_request_id,
          pagelen,
          page,
          all,
        });

        const result = await client.paginator.fetchValues(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/activity`,
          {
            pagelen,
            page,
            all,
            description: "getPullRequestActivity",
          }
        );

        return jsonResponse(result.values);
      } catch (error) {
        logger.error("Error getting pull request activity", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull request activity: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getPullRequestStatuses: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const pagelen = args.pagelen as number | undefined;
      const page = args.page as number | undefined;
      const all = args.all as boolean | undefined;

      try {
        logger.info("Getting pull request statuses", {
          workspace,
          repo_slug,
          pull_request_id,
          pagelen,
          page,
          all,
        });

        const result = await client.paginator.fetchValues(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/statuses`,
          {
            pagelen,
            page,
            all,
            description: "getPullRequestStatuses",
          }
        );

        const payload = {
          values: result.values,
          page: result.page,
          pagelen: result.pagelen,
          next: result.next,
          previous: result.previous,
          fetchedPages: result.fetchedPages,
          totalFetched: result.totalFetched,
        };

        return jsonResponse(payload);
      } catch (error) {
        logger.error("Error getting pull request statuses", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull request statuses: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  }),
};
