import { HandlerModule } from "./types.js";
import { BitbucketClient } from "../client.js";
import { jsonResponse } from "../utils.js";
import { logger } from "../logger.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

const BRANCH_SETTINGS_SCHEMA = {
  development: {
    type: "object",
    description: "Development branch settings",
    properties: {
      name: { type: "string", description: "Branch name" },
      use_mainbranch: {
        type: "boolean",
        description: "Use main branch",
      },
    },
  },
  production: {
    type: "object",
    description: "Production branch settings",
    properties: {
      name: { type: "string", description: "Branch name" },
      use_mainbranch: {
        type: "boolean",
        description: "Use main branch",
      },
      enabled: {
        type: "boolean",
        description: "Enable production branch",
      },
    },
  },
  branch_types: {
    type: "array",
    description: "Branch types configuration",
    items: {
      type: "object",
      properties: {
        kind: {
          type: "string",
          description: "Branch type kind (e.g., bugfix, feature)",
        },
        prefix: { type: "string", description: "Branch prefix" },
        enabled: {
          type: "boolean",
          description: "Enable this branch type",
        },
      },
      required: ["kind"],
    },
  },
};

export const branchingModelModule: HandlerModule = {
  tools: [
    {
      name: "getRepositoryBranchingModel",
      description: "Get the branching model for a repository",
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
      name: "getRepositoryBranchingModelSettings",
      description: "Get the branching model config for a repository",
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
      name: "updateRepositoryBranchingModelSettings",
      description: "Update the branching model config for a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          ...BRANCH_SETTINGS_SCHEMA,
        },
        required: ["workspace", "repo_slug"],
      },
    },
    {
      name: "getEffectiveRepositoryBranchingModel",
      description: "Get the effective branching model for a repository",
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
      name: "getProjectBranchingModel",
      description: "Get the branching model for a project",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          project_key: { type: "string", description: "Project key" },
        },
        required: ["workspace", "project_key"],
      },
    },
    {
      name: "getProjectBranchingModelSettings",
      description: "Get the branching model config for a project",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          project_key: { type: "string", description: "Project key" },
        },
        required: ["workspace", "project_key"],
      },
    },
    {
      name: "updateProjectBranchingModelSettings",
      description: "Update the branching model config for a project",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          project_key: { type: "string", description: "Project key" },
          ...BRANCH_SETTINGS_SCHEMA,
        },
        required: ["workspace", "project_key"],
      },
    },
  ],

  createHandlers: (client: BitbucketClient) => ({
    getRepositoryBranchingModel: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;

      try {
        logger.info("Getting repository branching model", {
          workspace,
          repo_slug,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/branching-model`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting repository branching model", {
          error,
          workspace,
          repo_slug,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get repository branching model: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getRepositoryBranchingModelSettings: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;

      try {
        logger.info("Getting repository branching model settings", {
          workspace,
          repo_slug,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/branching-model/settings`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting repository branching model settings", {
          error,
          workspace,
          repo_slug,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get repository branching model settings: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    updateRepositoryBranchingModelSettings: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const development = args.development as Record<string, unknown>;
      const production = args.production as Record<string, unknown>;
      const branch_types = args.branch_types as Array<Record<string, unknown>>;

      try {
        logger.info("Updating repository branching model settings", {
          workspace,
          repo_slug,
        });

        const payload: Record<string, unknown> = {};
        if (development) payload.development = development;
        if (production) payload.production = production;
        if (branch_types) payload.branch_types = branch_types;

        const response = await client.api.put(
          `/repositories/${workspace}/${repo_slug}/branching-model/settings`,
          payload
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error updating repository branching model settings", {
          error,
          workspace,
          repo_slug,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to update repository branching model settings: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getEffectiveRepositoryBranchingModel: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;

      try {
        logger.info("Getting effective repository branching model", {
          workspace,
          repo_slug,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/effective-branching-model`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting effective repository branching model", {
          error,
          workspace,
          repo_slug,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get effective repository branching model: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getProjectBranchingModel: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const project_key = args.project_key as string;

      try {
        logger.info("Getting project branching model", {
          workspace,
          project_key,
        });

        const response = await client.api.get(
          `/workspaces/${workspace}/projects/${project_key}/branching-model`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting project branching model", {
          error,
          workspace,
          project_key,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get project branching model: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getProjectBranchingModelSettings: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const project_key = args.project_key as string;

      try {
        logger.info("Getting project branching model settings", {
          workspace,
          project_key,
        });

        const response = await client.api.get(
          `/workspaces/${workspace}/projects/${project_key}/branching-model/settings`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting project branching model settings", {
          error,
          workspace,
          project_key,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get project branching model settings: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    updateProjectBranchingModelSettings: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const project_key = args.project_key as string;
      const development = args.development as Record<string, unknown>;
      const production = args.production as Record<string, unknown>;
      const branch_types = args.branch_types as Array<Record<string, unknown>>;

      try {
        logger.info("Updating project branching model settings", {
          workspace,
          project_key,
        });

        const payload: Record<string, unknown> = {};
        if (development) payload.development = development;
        if (production) payload.production = production;
        if (branch_types) payload.branch_types = branch_types;

        const response = await client.api.put(
          `/workspaces/${workspace}/projects/${project_key}/branching-model/settings`,
          payload
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error updating project branching model settings", {
          error,
          workspace,
          project_key,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to update project branching model settings: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  }),
};
