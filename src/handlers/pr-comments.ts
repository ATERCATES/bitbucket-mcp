import { HandlerModule } from "./types.js";
import { BitbucketClient } from "../client.js";
import { PAGINATION_BASE_SCHEMA, PAGINATION_ALL_SCHEMA } from "../schemas.js";
import { jsonResponse, textResponse } from "../utils.js";
import { logger } from "../logger.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { InlineCommentInline } from "../types.js";
import { BITBUCKET_MAX_PAGELEN } from "../pagination.js";

/** Schema for inline comment positioning */
const INLINE_COMMENT_SCHEMA = {
  type: "object",
  description: "Inline comment information for commenting on specific lines",
  properties: {
    path: {
      type: "string",
      description: "Path to the file in the repository",
    },
    from: {
      type: "number",
      description: "Line number in the old version of the file (for deleted or modified lines)",
    },
    to: {
      type: "number",
      description: "Line number in the new version of the file (for added or modified lines)",
    },
  },
  required: ["path"],
};

/** Common PR comment parameters */
const PR_COMMENT_BASE_PROPERTIES = {
  workspace: {
    type: "string",
    description: "Bitbucket workspace name",
  },
  repo_slug: { type: "string", description: "Repository slug" },
  pull_request_id: {
    type: "string",
    description: "Pull request ID",
  },
};

const PR_COMMENT_BASE_REQUIRED = ["workspace", "repo_slug", "pull_request_id"];

/** Extended properties for single comment operations */
const PR_COMMENT_WITH_ID_PROPERTIES = {
  ...PR_COMMENT_BASE_PROPERTIES,
  comment_id: { type: "string", description: "Comment ID" },
};

const PR_COMMENT_WITH_ID_REQUIRED = [...PR_COMMENT_BASE_REQUIRED, "comment_id"];

export const prCommentsModule: HandlerModule = {
  tools: [
    {
      name: "getPullRequestComments",
      description: "List comments on a pull request",
      inputSchema: {
        type: "object",
        properties: {
          ...PR_COMMENT_BASE_PROPERTIES,
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
        },
        required: PR_COMMENT_BASE_REQUIRED,
      },
    },
    {
      name: "addPullRequestComment",
      description: "Add a comment to a pull request (general or inline)",
      inputSchema: {
        type: "object",
        properties: {
          ...PR_COMMENT_BASE_PROPERTIES,
          content: {
            type: "string",
            description: "Comment content in markdown format",
          },
          pending: {
            type: "boolean",
            description: "Whether to create this comment as a pending comment (draft state)",
          },
          inline: INLINE_COMMENT_SCHEMA,
        },
        required: [...PR_COMMENT_BASE_REQUIRED, "content"],
      },
    },
    {
      name: "addPendingPullRequestComment",
      description: "Add a pending (draft) comment to a pull request that can be published later",
      inputSchema: {
        type: "object",
        properties: {
          ...PR_COMMENT_BASE_PROPERTIES,
          content: {
            type: "string",
            description: "Comment content in markdown format",
          },
          inline: INLINE_COMMENT_SCHEMA,
        },
        required: [...PR_COMMENT_BASE_REQUIRED, "content"],
      },
    },
    {
      name: "publishPendingComments",
      description: "Publish all pending comments for a pull request",
      inputSchema: {
        type: "object",
        properties: PR_COMMENT_BASE_PROPERTIES,
        required: PR_COMMENT_BASE_REQUIRED,
      },
    },
    {
      name: "getPullRequestComment",
      description: "Get a specific comment on a pull request",
      inputSchema: {
        type: "object",
        properties: PR_COMMENT_WITH_ID_PROPERTIES,
        required: PR_COMMENT_WITH_ID_REQUIRED,
      },
    },
    {
      name: "updatePullRequestComment",
      description: "Update a comment on a pull request",
      inputSchema: {
        type: "object",
        properties: {
          ...PR_COMMENT_WITH_ID_PROPERTIES,
          content: {
            type: "string",
            description: "Updated comment content",
          },
        },
        required: [...PR_COMMENT_WITH_ID_REQUIRED, "content"],
      },
    },
    {
      name: "deletePullRequestComment",
      description: "Delete a comment on a pull request",
      inputSchema: {
        type: "object",
        properties: PR_COMMENT_WITH_ID_PROPERTIES,
        required: PR_COMMENT_WITH_ID_REQUIRED,
      },
    },
    {
      name: "resolveComment",
      description: "Resolve a comment thread on a pull request",
      inputSchema: {
        type: "object",
        properties: PR_COMMENT_WITH_ID_PROPERTIES,
        required: PR_COMMENT_WITH_ID_REQUIRED,
      },
    },
    {
      name: "reopenComment",
      description: "Reopen a resolved comment thread on a pull request",
      inputSchema: {
        type: "object",
        properties: PR_COMMENT_WITH_ID_PROPERTIES,
        required: PR_COMMENT_WITH_ID_REQUIRED,
      },
    },
  ],

  dangerousTools: ["deletePullRequestComment"],

  createHandlers: (client: BitbucketClient) => ({
    getPullRequestComments: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const pagelen = args.pagelen as number | undefined;
      const page = args.page as number | undefined;
      const all = args.all as boolean | undefined;

      try {
        logger.info("Getting Bitbucket pull request comments", {
          workspace,
          repo_slug,
          pull_request_id,
          pagelen,
          page,
          all,
        });

        const result = await client.paginator.fetchValues(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/comments`,
          {
            pagelen,
            page,
            all,
            description: "getPullRequestComments",
          }
        );

        return jsonResponse(result.values);
      } catch (error) {
        logger.error("Error getting pull request comments", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull request comments: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    addPullRequestComment: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const content = args.content as string;
      const inline = args.inline as InlineCommentInline | undefined;
      const pending = args.pending as boolean | undefined;

      try {
        logger.info("Adding comment to Bitbucket pull request", {
          workspace,
          repo_slug,
          pull_request_id,
          inline: inline ? "inline comment" : "general comment",
        });

        // Prepare the comment data
        const commentData: Record<string, unknown> = {
          content: {
            raw: content,
          },
        };

        // Add pending flag if provided
        if (pending !== undefined) {
          commentData.pending = pending;
        }

        // Add inline information if provided
        if (inline) {
          const inlineData: Record<string, unknown> = {
            path: inline.path,
          };

          // Add line number information based on the type
          if (inline.from !== undefined) {
            inlineData.from = inline.from;
          }
          if (inline.to !== undefined) {
            inlineData.to = inline.to;
          }

          commentData.inline = inlineData;
        }

        const response = await client.api.post(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/comments`,
          commentData
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error adding comment to pull request", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to add pull request comment: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    addPendingPullRequestComment: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const content = args.content as string;
      const inline = args.inline as InlineCommentInline | undefined;

      try {
        logger.info("Adding pending comment to Bitbucket pull request", {
          workspace,
          repo_slug,
          pull_request_id,
          inline: inline ? "inline comment" : "general comment",
        });

        // Prepare the comment data with pending=true
        const commentData: Record<string, unknown> = {
          content: {
            raw: content,
          },
          pending: true,
        };

        // Add inline information if provided
        if (inline) {
          const inlineData: Record<string, unknown> = {
            path: inline.path,
          };

          if (inline.from !== undefined) {
            inlineData.from = inline.from;
          }
          if (inline.to !== undefined) {
            inlineData.to = inline.to;
          }

          commentData.inline = inlineData;
        }

        const response = await client.api.post(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/comments`,
          commentData
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error adding pending comment to pull request", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to add pending pull request comment: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    publishPendingComments: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;

      try {
        logger.info("Publishing pending comments for Bitbucket pull request", {
          workspace,
          repo_slug,
          pull_request_id,
        });

        // First, get all pending comments for the pull request
        const commentsResult = await client.paginator.fetchValues(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/comments`,
          {
            pagelen: BITBUCKET_MAX_PAGELEN,
            all: true,
            description: "publishPendingComments",
          }
        );

        type PendingComment = {
          id: number;
          content: { raw?: string; html?: string; markup?: string };
          inline?: InlineCommentInline;
          pending?: boolean;
        };

        const comments = (commentsResult.values || []) as PendingComment[];
        const pendingComments = comments.filter((comment) => comment.pending === true);

        if (pendingComments.length === 0) {
          return textResponse("No pending comments found to publish.");
        }

        // Publish each pending comment by updating it with pending=false
        const publishResults = [];
        for (const comment of pendingComments) {
          try {
            const updateResponse = await client.api.put(
              `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/comments/${comment.id}`,
              {
                content: comment.content,
                pending: false,
                ...(comment.inline && { inline: comment.inline }),
              }
            );
            publishResults.push({
              commentId: comment.id,
              status: "published",
              data: updateResponse.data,
            });
          } catch (error) {
            publishResults.push({
              commentId: comment.id,
              status: "error",
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        return jsonResponse({
          message: `Published ${pendingComments.length} pending comments`,
          results: publishResults,
        });
      } catch (error) {
        logger.error("Error publishing pending comments", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to publish pending comments: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    getPullRequestComment: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const comment_id = args.comment_id as string;

      try {
        logger.info("Getting pull request comment", {
          workspace,
          repo_slug,
          pull_request_id,
          comment_id,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/comments/${comment_id}`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting pull request comment", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
          comment_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pull request comment: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    updatePullRequestComment: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const comment_id = args.comment_id as string;
      const content = args.content as string;

      try {
        logger.info("Updating pull request comment", {
          workspace,
          repo_slug,
          pull_request_id,
          comment_id,
        });

        const response = await client.api.put(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/comments/${comment_id}`,
          {
            content: { raw: content },
          }
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error updating pull request comment", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
          comment_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to update pull request comment: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    deletePullRequestComment: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const comment_id = args.comment_id as string;

      try {
        logger.info("Deleting pull request comment", {
          workspace,
          repo_slug,
          pull_request_id,
          comment_id,
        });

        await client.api.delete(
          `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/comments/${comment_id}`
        );

        return textResponse("Comment deleted successfully.");
      } catch (error) {
        logger.error("Error deleting pull request comment", {
          error,
          workspace,
          repo_slug,
          pull_request_id,
          comment_id,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to delete pull request comment: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },

    resolveComment: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const comment_id = args.comment_id as string;

      return setCommentResolved(client, workspace, repo_slug, pull_request_id, comment_id, true);
    },

    reopenComment: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pull_request_id = args.pull_request_id as string;
      const comment_id = args.comment_id as string;

      return setCommentResolved(client, workspace, repo_slug, pull_request_id, comment_id, false);
    },
  }),
};

/**
 * Helper function to resolve or reopen a comment thread
 */
async function setCommentResolved(
  client: BitbucketClient,
  workspace: string,
  repo_slug: string,
  pull_request_id: string,
  comment_id: string,
  resolved: boolean
) {
  try {
    logger.info("Setting comment resolved state", {
      workspace,
      repo_slug,
      pull_request_id,
      comment_id,
      resolved,
    });

    const commentUrl = (id: string) =>
      `/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/comments/${id}`;
    const resolveUrl = (id: string) => `${commentUrl(id)}/resolve`;

    // Bitbucket resolves comment *threads*, and the API expects the thread root comment ID.
    // If the provided comment_id is a reply, walk up the parent chain to find the root.
    let targetCommentId = comment_id;
    try {
      const visited = new Set<string>();
      for (let depth = 0; depth < 25; depth++) {
        if (visited.has(targetCommentId)) break;
        visited.add(targetCommentId);

        const commentResponse = await client.api.get(commentUrl(targetCommentId));
        const parentId = commentResponse.data?.parent?.id;
        if (parentId === undefined || parentId === null) break;
        targetCommentId = String(parentId);
      }
    } catch (lookupError) {
      // If we fail to look up the comment hierarchy, still attempt to resolve the provided ID.
      logger.warn("Failed to resolve comment thread root; falling back to comment_id", {
        error: lookupError,
        workspace,
        repo_slug,
        pull_request_id,
        comment_id,
      });
      targetCommentId = comment_id;
    }

    const response = resolved
      ? await client.api.post(resolveUrl(targetCommentId))
      : await client.api.delete(resolveUrl(targetCommentId));

    const responseText =
      response.data === undefined || response.data === null || response.data === ""
        ? resolved
          ? `Comment thread resolved (comment_id: ${targetCommentId}).`
          : `Comment thread reopened (comment_id: ${targetCommentId}).`
        : JSON.stringify(response.data, null, 2);

    return textResponse(responseText);
  } catch (error) {
    logger.error("Error setting comment resolved state", {
      error,
      workspace,
      repo_slug,
      pull_request_id,
      comment_id,
      resolved,
    });
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to update comment resolved state: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
