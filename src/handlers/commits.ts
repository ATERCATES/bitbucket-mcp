import { HandlerModule } from "./types.js";
import { PAGINATION_BASE_SCHEMA, PAGINATION_ALL_SCHEMA } from "../schemas.js";
import { jsonResponse } from "../utils.js";

export const commitsModule: HandlerModule = {
  tools: [
    {
      name: "listCommits",
      description: "List commits in a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          branch: {
            type: "string",
            description: "Branch name or commit hash to start from",
          },
          include: {
            type: "array",
            items: { type: "string" },
            description: "Commits to include (merges, etc)",
          },
          exclude: {
            type: "array",
            items: { type: "string" },
            description: "Commits to exclude",
          },
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
        },
        required: ["workspace", "repo_slug"],
      },
    },
    {
      name: "getCommit",
      description: "Get a specific commit from a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          sha: { type: "string", description: "Commit SHA" },
        },
        required: ["workspace", "repo_slug", "sha"],
      },
    },
  ],
  createHandlers: (client) => ({
    listCommits: async (args) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const branch = args.branch as string | undefined;

      const params: Record<string, unknown> = {};
      if (args.include) params.include = args.include;
      if (args.exclude) params.exclude = args.exclude;

      const url = branch
        ? `/repositories/${workspace}/${repo_slug}/commits/${branch}`
        : `/repositories/${workspace}/${repo_slug}/commits`;

      const result = await client.paginator.fetchValues(url, {
        pagelen: args.pagelen as number,
        page: args.page as number,
        all: args.all as boolean,
        params,
        description: "listCommits",
      });
      return jsonResponse(result.values);
    },
    getCommit: async (args) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const sha = args.sha as string;

      const response = await client.api.get(
        `/repositories/${workspace}/${repo_slug}/commit/${sha}`
      );
      return jsonResponse(response.data);
    },
  }),
};
