import { HandlerModule } from "./types.js";
import { BitbucketClient } from "../client.js";
import { PAGINATION_BASE_SCHEMA, PAGINATION_ALL_SCHEMA, LEGACY_LIMIT_SCHEMA } from "../schemas.js";
import { jsonResponse } from "../utils.js";
import { logger } from "../logger.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { BitbucketRepository } from "../types.js";

export const repositoriesModule: HandlerModule = {
  tools: [
    {
      name: "listRepositories",
      description: "List Bitbucket repositories",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          name: {
            type: "string",
            description: "Filter repositories by name (partial match supported)",
          },
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
          limit: LEGACY_LIMIT_SCHEMA,
        },
      },
    },
    {
      name: "getRepository",
      description: "Get repository details",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
        },
        required: ["workspace", "repo_slug"],
      },
    },
    {
      name: "getEffectiveDefaultReviewers",
      description: "Get effective default reviewers for a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
        },
        required: ["workspace", "repo_slug"],
      },
    },
  ],

  createHandlers: (client: BitbucketClient) => ({
    listRepositories: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string | undefined;
      const pagelen = args.pagelen as number | undefined;
      const page = args.page as number | undefined;
      const all = args.all as boolean | undefined;
      const name = args.name as string | undefined;
      const legacyLimit = args.limit as number | undefined;

      try {
        const wsName = client.resolveWorkspace(workspace);

        logger.info("Listing Bitbucket repositories", {
          workspace: wsName,
          pagelen: pagelen ?? legacyLimit,
          page,
          all,
          name,
        });

        const params: Record<string, unknown> = {};
        if (name) {
          params.q = `name~"${name}"`;
        }

        const repositories = await client.paginator.fetchValues<BitbucketRepository>(
          `/repositories/${wsName}`,
          {
            pagelen: pagelen ?? legacyLimit,
            page,
            all,
            params,
            description: "listRepositories",
          }
        );

        return jsonResponse(repositories.values);
      } catch (error) {
        logger.error("Error listing repositories", { error, workspace, name });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to list repositories: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    getRepository: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;

      try {
        logger.info("Getting Bitbucket repository info", {
          workspace,
          repo_slug,
        });

        const response = await client.api.get(`/repositories/${workspace}/${repo_slug}`);

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting repository", { error, workspace, repo_slug });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get repository: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    getEffectiveDefaultReviewers: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;

      try {
        logger.info("Getting effective default reviewers", {
          workspace,
          repo_slug,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/effective-default-reviewers`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting effective default reviewers", {
          error,
          workspace,
          repo_slug,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get effective default reviewers: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  }),
};
