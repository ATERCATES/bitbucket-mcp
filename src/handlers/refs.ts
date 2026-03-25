import { HandlerModule } from "./types.js";
import { PAGINATION_BASE_SCHEMA, PAGINATION_ALL_SCHEMA } from "../schemas.js";
import { jsonResponse } from "../utils.js";
import { logger } from "../logger.js";

export const refsModule: HandlerModule = {
  tools: [
    {
      name: "listBranches",
      description: "List branches in a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          q: {
            type: "string",
            description: "Query string to filter branches",
          },
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
        },
        required: ["workspace", "repo_slug"],
      },
    },
    {
      name: "createBranch",
      description: "Create a new branch in a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          name: { type: "string", description: "Name of the new branch" },
          target: {
            type: "object",
            properties: {
              hash: { type: "string", description: "Commit hash to branch from" },
            },
            required: ["hash"],
          },
        },
        required: ["workspace", "repo_slug", "name", "target"],
      },
    },
    {
      name: "getBranch",
      description: "Get a specific branch from a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          name: { type: "string", description: "Name of the branch" },
        },
        required: ["workspace", "repo_slug", "name"],
      },
    },
    {
      name: "deleteBranch",
      description: "Delete a branch from a repository (DANGEROUS)",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          name: { type: "string", description: "Name of the branch to delete" },
        },
        required: ["workspace", "repo_slug", "name"],
      },
    },
    {
      name: "listTags",
      description: "List tags in a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          q: {
            type: "string",
            description: "Query string to filter tags",
          },
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
        },
        required: ["workspace", "repo_slug"],
      },
    },
    {
      name: "createTag",
      description: "Create a new tag in a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          name: { type: "string", description: "Name of the new tag" },
          target: {
            type: "object",
            properties: {
              hash: { type: "string", description: "Commit hash to tag" },
            },
            required: ["hash"],
          },
          message: { type: "string", description: "Optional tag message" },
        },
        required: ["workspace", "repo_slug", "name", "target"],
      },
    },
    {
      name: "getTag",
      description: "Get a specific tag from a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          name: { type: "string", description: "Name of the tag" },
        },
        required: ["workspace", "repo_slug", "name"],
      },
    },
    {
      name: "deleteTag",
      description: "Delete a tag from a repository (DANGEROUS)",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          name: { type: "string", description: "Name of the tag to delete" },
        },
        required: ["workspace", "repo_slug", "name"],
      },
    },
  ],
  dangerousTools: ["deleteBranch", "deleteTag"],
  createHandlers: (client) => ({
    listBranches: async (args) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const q = args.q as string | undefined;

      const params: Record<string, unknown> = {};
      if (q) params.q = q;

      const result = await client.paginator.fetchValues(
        `/repositories/${workspace}/${repo_slug}/refs/branches`,
        {
          pagelen: args.pagelen as number,
          page: args.page as number,
          all: args.all as boolean,
          params,
          description: "listBranches",
        }
      );
      return jsonResponse(result.values);
    },
    createBranch: async (args) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const name = args.name as string;
      const target = args.target as { hash: string };

      logger.info(`Creating branch ${name} in ${workspace}/${repo_slug}`);

      const response = await client.api.post(
        `/repositories/${workspace}/${repo_slug}/refs/branches`,
        { name, target }
      );
      return jsonResponse(response.data);
    },
    getBranch: async (args) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const name = args.name as string;

      const response = await client.api.get(
        `/repositories/${workspace}/${repo_slug}/refs/branches/${name}`
      );
      return jsonResponse(response.data);
    },
    deleteBranch: async (args) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const name = args.name as string;

      logger.info(`Deleting branch ${name} from ${workspace}/${repo_slug}`);

      await client.api.delete(`/repositories/${workspace}/${repo_slug}/refs/branches/${name}`);
      return jsonResponse({ success: true });
    },
    listTags: async (args) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const q = args.q as string | undefined;

      const params: Record<string, unknown> = {};
      if (q) params.q = q;

      const result = await client.paginator.fetchValues(
        `/repositories/${workspace}/${repo_slug}/refs/tags`,
        {
          pagelen: args.pagelen as number,
          page: args.page as number,
          all: args.all as boolean,
          params,
          description: "listTags",
        }
      );
      return jsonResponse(result.values);
    },
    createTag: async (args) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const name = args.name as string;
      const target = args.target as { hash: string };
      const message = args.message as string | undefined;

      logger.info(`Creating tag ${name} in ${workspace}/${repo_slug}`);

      const response = await client.api.post(`/repositories/${workspace}/${repo_slug}/refs/tags`, {
        name,
        target,
        message,
      });
      return jsonResponse(response.data);
    },
    getTag: async (args) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const name = args.name as string;

      const response = await client.api.get(
        `/repositories/${workspace}/${repo_slug}/refs/tags/${name}`
      );
      return jsonResponse(response.data);
    },
    deleteTag: async (args) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const name = args.name as string;

      logger.info(`Deleting tag ${name} from ${workspace}/${repo_slug}`);

      await client.api.delete(`/repositories/${workspace}/${repo_slug}/refs/tags/${name}`);
      return jsonResponse({ success: true });
    },
  }),
};
