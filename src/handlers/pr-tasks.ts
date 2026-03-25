import { HandlerModule } from "./types.js";
import { BitbucketClient } from "../client.js";
import { jsonResponse, textResponse } from "../utils.js";
import { logger } from "../logger.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

export const prTasksModule: HandlerModule = {
  tools: [
    {
      name: "getPullRequestTasks",
      description: "List tasks on a pull request",
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
      name: "createPullRequestTask",
      description: "Create a task on a pull request",
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
          content: { type: "string", description: "Task content" },
          comment: {
            type: "number",
            description: "Optional comment ID to attach the task",
          },
          state: {
            type: "string",
            enum: ["UNRESOLVED", "RESOLVED"],
            description: "Initial task state",
          },
        },
        required: ["workspace", "repo_slug", "pull_request_id", "content"],
      },
    },
    {
      name: "getPullRequestTask",
      description: "Get a specific task on a pull request",
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
          task_id: { type: "string", description: "Task ID" },
        },
        required: ["workspace", "repo_slug", "pull_request_id", "task_id"],
      },
    },
    {
      name: "updatePullRequestTask",
      description: "Update a task on a pull request",
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
          task_id: { type: "string", description: "Task ID" },
          content: { type: "string", description: "Updated task content" },
          state: {
            type: "string",
            enum: ["UNRESOLVED", "RESOLVED"],
            description: "Updated task state",
          },
        },
        required: ["workspace", "repo_slug", "pull_request_id", "task_id"],
      },
    },
    {
      name: "deletePullRequestTask",
      description: "Delete a task from a pull request",
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
          task_id: { type: "string", description: "Task ID" },
        },
        required: ["workspace", "repo_slug", "pull_request_id", "task_id"],
      },
    },
  ],

  dangerousTools: ["deletePullRequestTask"],

  createHandlers: (client: BitbucketClient) => ({
    getPullRequestTasks: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const pagelen = args.pagelen as number | undefined;
      const page = args.page as number | undefined;
      const all = args.all as boolean | undefined;

      try {
        logger.info("Getting pull request tasks", {
          workspace,
          repo_slug,
          pull_request_id,
          pagelen,
          page,
          all,
        });

        const result = await client.paginator.fetchValues(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/tasks`,
          {
            pagelen,
            page,
            all,
            description: "getPullRequestTasks",
          }
        );

        return jsonResponse(result.values);
      } catch (error) {
        logger.error("Error getting pull request tasks", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull request tasks: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    createPullRequestTask: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const content = args.content as string;
      const commentId = args.comment as number | undefined;
      const state = args.state as "UNRESOLVED" | "RESOLVED" | undefined;

      try {
        logger.info("Creating pull request task", {
          workspace,
          repo_slug,
          pull_request_id,
        });

        const data: Record<string, unknown> = { content: { raw: content } };
        if (commentId) data.comment = { id: commentId };
        if (state) data.state = state;

        const response = await client.api.post(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/tasks`,
          data
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error creating pull request task", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to create pull request task: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getPullRequestTask: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const task_id = args.task_id as string;

      try {
        logger.info("Getting pull request task", {
          workspace,
          repo_slug,
          pull_request_id,
          task_id,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/tasks/${task_id}`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting pull request task", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
          task_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull request task: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    updatePullRequestTask: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const task_id = args.task_id as string;
      const content = args.content as string | undefined;
      const state = args.state as "UNRESOLVED" | "RESOLVED" | undefined;

      try {
        logger.info("Updating pull request task", {
          workspace,
          repo_slug,
          pull_request_id,
          task_id,
        });

        const data: Record<string, unknown> = {};
        if (content !== undefined) data.content = { raw: content };
        if (state !== undefined) data.state = state;

        const response = await client.api.put(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/tasks/${task_id}`,
          data
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error updating pull request task", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
          task_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to update pull request task: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    deletePullRequestTask: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const task_id = args.task_id as string;

      try {
        logger.info("Deleting pull request task", {
          workspace,
          repo_slug,
          pull_request_id,
          task_id,
        });

        await client.api.delete(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/tasks/${task_id}`
        );

        return textResponse("Task deleted successfully.");
      } catch (error) {
        logger.error("Error deleting pull request task", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
          task_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to delete pull request task: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  }),
};
