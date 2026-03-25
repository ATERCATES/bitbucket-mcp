import { HandlerModule } from "./types.js";
import { BitbucketClient } from "../client.js";
import { PAGINATION_BASE_SCHEMA, PAGINATION_ALL_SCHEMA, LEGACY_LIMIT_SCHEMA } from "../schemas.js";
import { jsonResponse, textResponse } from "../utils.js";
import { logger } from "../logger.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import os from "os";

export const pipelinesModule: HandlerModule = {
  tools: [
    {
      name: "listPipelineRuns",
      description: "List pipeline runs for a repository",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
          limit: LEGACY_LIMIT_SCHEMA,
          status: {
            type: "string",
            enum: ["PENDING", "IN_PROGRESS", "SUCCESSFUL", "FAILED", "ERROR", "STOPPED"],
            description: "Filter pipelines by status",
          },
          target_branch: {
            type: "string",
            description: "Filter pipelines by target branch",
          },
          trigger_type: {
            type: "string",
            enum: ["manual", "push", "pullrequest", "schedule"],
            description: "Filter pipelines by trigger type",
          },
        },
        required: ["workspace", "repo_slug"],
      },
    },
    {
      name: "getPipelineRun",
      description: "Get details for a specific pipeline run",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pipeline_uuid: {
            type: "string",
            description: "Pipeline UUID",
          },
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
        },
        required: ["workspace", "repo_slug", "pipeline_uuid"],
      },
    },
    {
      name: "runPipeline",
      description: "Trigger a new pipeline run",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          target: {
            type: "object",
            description: "Pipeline target configuration",
            properties: {
              ref_type: {
                type: "string",
                enum: ["branch", "tag", "bookmark", "named_branch"],
                description: "Reference type",
              },
              ref_name: {
                type: "string",
                description: "Reference name (branch, tag, etc.)",
              },
              commit_hash: {
                type: "string",
                description: "Specific commit hash to run pipeline on",
              },
              selector_type: {
                type: "string",
                enum: ["default", "custom", "branches", "tags", "bookmarks"],
                description: "Pipeline selector type",
              },
              selector_pattern: {
                type: "string",
                description: "Pipeline selector pattern (for custom pipelines)",
              },
            },
            required: ["ref_type", "ref_name"],
          },
          variables: {
            type: "array",
            description: "Pipeline variables",
            items: {
              type: "object",
              properties: {
                key: { type: "string", description: "Variable name" },
                value: { type: "string", description: "Variable value" },
                secured: {
                  type: "boolean",
                  description: "Whether the variable is secured",
                },
              },
              required: ["key", "value"],
            },
          },
        },
        required: ["workspace", "repo_slug", "target"],
      },
    },
    {
      name: "stopPipeline",
      description: "Stop a running pipeline",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pipeline_uuid: {
            type: "string",
            description: "Pipeline UUID",
          },
        },
        required: ["workspace", "repo_slug", "pipeline_uuid"],
      },
    },
    {
      name: "getPipelineSteps",
      description: "List steps for a pipeline run",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pipeline_uuid: {
            type: "string",
            description: "Pipeline UUID",
          },
        },
        required: ["workspace", "repo_slug", "pipeline_uuid"],
      },
    },
    {
      name: "getPipelineStep",
      description: "Get details for a specific pipeline step",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pipeline_uuid: {
            type: "string",
            description: "Pipeline UUID",
          },
          step_uuid: {
            type: "string",
            description: "Step UUID",
          },
        },
        required: ["workspace", "repo_slug", "pipeline_uuid", "step_uuid"],
      },
    },
    {
      name: "getPipelineStepLogs",
      description: "Get logs for a specific pipeline step",
      inputSchema: {
        type: "object",
        properties: {
          workspace: {
            type: "string",
            description: "Bitbucket workspace name",
          },
          repo_slug: { type: "string", description: "Repository slug" },
          pipeline_uuid: {
            type: "string",
            description: "Pipeline UUID",
          },
          step_uuid: {
            type: "string",
            description: "Step UUID",
          },
          max_lines: {
            type: "number",
            description: "Maximum number of log lines to return (default 500)",
            minimum: 1,
            maximum: 5000,
          },
          tail: {
            type: "boolean",
            description: "When true, returns the most recent lines instead of the first lines",
          },
          errors_only: {
            type: "boolean",
            description:
              "When true, only include lines that look like errors (case-insensitive match on error keywords)",
          },
          search_term: {
            type: "string",
            description: "Optional case-insensitive search term to filter log lines",
          },
          save_to_file: {
            type: "boolean",
            description:
              "Save the full log to a temporary file and return the path for offline review",
          },
        },
        required: ["workspace", "repo_slug", "pipeline_uuid", "step_uuid"],
      },
    },
  ],

  createHandlers: (client: BitbucketClient) => ({
    listPipelineRuns: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pagelen = args.pagelen as number | undefined;
      const page = args.page as number | undefined;
      const all = args.all as boolean | undefined;
      const status = args.status as
        | "PENDING"
        | "IN_PROGRESS"
        | "SUCCESSFUL"
        | "FAILED"
        | "ERROR"
        | "STOPPED"
        | undefined;
      const target_branch = args.target_branch as string | undefined;
      const trigger_type = args.trigger_type as
        | "manual"
        | "push"
        | "pullrequest"
        | "schedule"
        | undefined;
      const legacyLimit = args.limit as number | undefined;

      try {
        logger.info("Listing pipeline runs", {
          workspace,
          repo_slug,
          pagelen: pagelen ?? legacyLimit,
          page,
          all,
          status,
          target_branch,
          trigger_type,
        });

        const params: Record<string, unknown> = {};
        if (status) params.status = status;
        if (target_branch) params["target.branch"] = target_branch;
        if (trigger_type) params.trigger_type = trigger_type;

        const result = await client.paginator.fetchValues(
          `/repositories/${workspace}/${repo_slug}/pipelines`,
          {
            pagelen: pagelen ?? legacyLimit,
            page,
            all,
            params,
            description: "listPipelineRuns",
          }
        );

        return jsonResponse(result.values);
      } catch (error) {
        logger.error("Error listing pipeline runs", {
          error,
          workspace,
          repo_slug,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to list pipeline runs: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    getPipelineRun: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pipeline_uuid = args.pipeline_uuid as string;

      try {
        logger.info("Getting pipeline run details", {
          workspace,
          repo_slug,
          pipeline_uuid,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/pipelines/${pipeline_uuid}`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting pipeline run", {
          error,
          workspace,
          repo_slug,
          pipeline_uuid,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pipeline run: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    runPipeline: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const target = args.target as {
        ref_type: string;
        ref_name: string;
        commit_hash?: string;
        selector_type?: string;
        selector_pattern?: string;
      };
      const variables = args.variables as
        | Array<{ key: string; value: string; secured?: boolean }>
        | undefined;

      try {
        logger.info("Triggering pipeline run", {
          workspace,
          repo_slug,
          target,
          variables: variables?.length || 0,
        });

        // Build the target object based on the input
        const pipelineTarget: Record<string, unknown> = {
          type: target.commit_hash ? "pipeline_commit_target" : "pipeline_ref_target",
          ref_type: target.ref_type,
          ref_name: target.ref_name,
        };

        // Add commit if specified
        if (target.commit_hash) {
          pipelineTarget.commit = {
            type: "commit",
            hash: target.commit_hash,
          };
        }

        // Add selector if specified
        if (target.selector_type && target.selector_pattern) {
          pipelineTarget.selector = {
            type: target.selector_type,
            pattern: target.selector_pattern,
          };
        }

        // Build the request data
        const requestData: Record<string, unknown> = {
          target: pipelineTarget,
        };

        // Add variables if provided
        if (variables && variables.length > 0) {
          requestData.variables = variables.map((variable) => ({
            key: variable.key,
            value: variable.value,
            secured: variable.secured || false,
          }));
        }

        const response = await client.api.post(
          `/repositories/${workspace}/${repo_slug}/pipelines`,
          requestData
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error running pipeline", {
          error,
          workspace,
          repo_slug,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to run pipeline: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    stopPipeline: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pipeline_uuid = args.pipeline_uuid as string;

      try {
        logger.info("Stopping pipeline", {
          workspace,
          repo_slug,
          pipeline_uuid,
        });

        await client.api.post(
          `/repositories/${workspace}/${repo_slug}/pipelines/${pipeline_uuid}/stopPipeline`
        );

        return textResponse("Pipeline stop signal sent successfully.");
      } catch (error) {
        logger.error("Error stopping pipeline", {
          error,
          workspace,
          repo_slug,
          pipeline_uuid,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to stop pipeline: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    getPipelineSteps: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pipeline_uuid = args.pipeline_uuid as string;
      const pagelen = args.pagelen as number | undefined;
      const page = args.page as number | undefined;
      const all = args.all as boolean | undefined;

      try {
        logger.info("Getting pipeline steps", {
          workspace,
          repo_slug,
          pipeline_uuid,
          pagelen,
          page,
          all,
        });

        const result = await client.paginator.fetchValues(
          `/repositories/${workspace}/${repo_slug}/pipelines/${pipeline_uuid}/steps`,
          {
            pagelen,
            page,
            all,
            description: "getPipelineSteps",
          }
        );

        return jsonResponse(result.values);
      } catch (error) {
        logger.error("Error getting pipeline steps", {
          error,
          workspace,
          repo_slug,
          pipeline_uuid,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pipeline steps: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    getPipelineStep: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pipeline_uuid = args.pipeline_uuid as string;
      const step_uuid = args.step_uuid as string;

      try {
        logger.info("Getting pipeline step details", {
          workspace,
          repo_slug,
          pipeline_uuid,
          step_uuid,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/pipelines/${pipeline_uuid}/steps/${step_uuid}`
        );

        return jsonResponse(response.data);
      } catch (error) {
        logger.error("Error getting pipeline step", {
          error,
          workspace,
          repo_slug,
          pipeline_uuid,
          step_uuid,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pipeline step: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    getPipelineStepLogs: async (args: Record<string, unknown>) => {
      const workspace = args.workspace as string;
      const repo_slug = args.repo_slug as string;
      const pipeline_uuid = args.pipeline_uuid as string;
      const step_uuid = args.step_uuid as string;
      const maxLines = args.max_lines as number | undefined;
      const tail = args.tail as boolean | undefined;
      const errorsOnly = args.errors_only as boolean | undefined;
      const searchTerm = args.search_term as string | undefined;
      const saveToFile = args.save_to_file as boolean | undefined;

      try {
        logger.info("Getting pipeline step logs", {
          workspace,
          repo_slug,
          pipeline_uuid,
          step_uuid,
          maxLines,
          tail,
          errorsOnly,
          searchTerm,
          saveToFile,
        });

        const response = await client.api.get(
          `/repositories/${workspace}/${repo_slug}/pipelines/${pipeline_uuid}/steps/${step_uuid}/log`,
          {
            maxRedirects: 5, // Follow redirects to S3
            responseType: "text",
          }
        );

        const rawLog =
          typeof response.data === "string"
            ? response.data
            : response.data === undefined || response.data === null
              ? ""
              : String(response.data);
        const allLines = rawLog.length > 0 ? rawLog.split(/\r?\n/) : [];
        const totalLines = allLines.length;

        let filteredLines = allLines;
        const normalizedSearch = searchTerm?.trim().toLowerCase();
        if (errorsOnly) {
          const errorRegex = /(error|failed|failure|exception|traceback|fatal)/i;
          filteredLines = filteredLines.filter((line) => errorRegex.test(line));
        }
        if (normalizedSearch && normalizedSearch.length > 0) {
          filteredLines = filteredLines.filter((line) =>
            line.toLowerCase().includes(normalizedSearch)
          );
        }

        const defaultMaxLines = 500;
        const normalizedMaxLines =
          typeof maxLines === "number" && Number.isFinite(maxLines)
            ? Math.floor(maxLines)
            : defaultMaxLines;
        const resolvedMaxLines = Math.max(1, Math.min(normalizedMaxLines, 5000));

        const hasLines = filteredLines.length > 0;
        const limitedLines = hasLines
          ? tail
            ? filteredLines.slice(-resolvedMaxLines)
            : filteredLines.slice(0, resolvedMaxLines)
          : [];
        const wasTruncated = hasLines && filteredLines.length > limitedLines.length;

        const summaryParts: string[] = [`Total log lines: ${totalLines}.`];
        if (errorsOnly || (normalizedSearch && normalizedSearch.length > 0)) {
          summaryParts.push(`Lines after filtering: ${filteredLines.length}.`);
        }
        if (!hasLines) {
          summaryParts.push("No log lines matched the provided filters.");
        } else {
          summaryParts.push(
            `Showing ${limitedLines.length} ${tail ? "most recent" : "earliest"} lines${
              wasTruncated ? ` (limited to ${resolvedMaxLines} lines)` : ""
            }.`
          );
        }

        if (saveToFile) {
          try {
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bitbucket-mcp-"));
            const safeFileName = `pipeline-${pipeline_uuid}-step-${step_uuid}.log`.replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            );
            const filePath = path.join(tempDir, safeFileName);
            fs.writeFileSync(filePath, rawLog, "utf8");
            summaryParts.push(`Full log saved to: ${filePath}`);
          } catch (fileError) {
            logger.warn("Failed to save pipeline step log to file", {
              error: fileError,
            });
            summaryParts.push(
              "Attempted to save the full log to a temporary file, but writing failed."
            );
          }
        }

        if (!saveToFile && wasTruncated) {
          summaryParts.push(
            "Use max_lines, tail, search_term, or save_to_file to refine or download the full log."
          );
        }

        const summary = summaryParts.join(" ");

        const textContent = hasLines ? `${summary}\n\n${limitedLines.join("\n")}` : summary;

        return textResponse(textContent);
      } catch (error) {
        logger.error("Error getting pipeline step logs", {
          error,
          workspace,
          repo_slug,
          pipeline_uuid,
          step_uuid,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get pipeline step logs: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  }),
};
