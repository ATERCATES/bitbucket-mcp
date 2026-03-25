import { HandlerModule } from "./types.js";
import { textResponse } from "../utils.js";
import { logger } from "../logger.js";

export const sourceModule: HandlerModule = {
  tools: [
    {
      name: "getFileContent",
      description: "Get the content of a file from a Bitbucket repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: { type: "string", description: "Bitbucket workspace name" },
          repo_slug: { type: "string", description: "Repository slug" },
          path: { type: "string", description: "Path to file in repository" },
          commit: {
            type: "string",
            description: "Commit SHA, branch, or tag (defaults to main branch)",
          },
        },
        required: ["workspace", "repo_slug", "path"],
      },
    },
  ],
  createHandlers: (client) => ({
    getFileContent: async (args) => {
      const workspace = client.resolveWorkspace(args.workspace as string);
      const repo_slug = args.repo_slug as string;
      const path = args.path as string;
      const commit = (args.commit as string) || "HEAD";

      logger.info(`Getting file content for ${workspace}/${repo_slug}/${path} at ${commit}`);

      const response = await client.api.get(
        `/repositories/${workspace}/${repo_slug}/src/${commit}/${path}`,
        { headers: { Accept: "text/plain" }, responseType: "text" }
      );
      return textResponse(response.data);
    },
  }),
};
