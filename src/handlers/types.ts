import { BitbucketClient } from "../client.js";

/**
 * JSON Schema for a tool's input
 */
export interface ToolInputSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
}

/**
 * Definition of an MCP tool
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
}

/**
 * Response format for MCP tools
 */
export interface ToolResponse {
  content: Array<{ type: "text"; text: string }>;
  [key: string]: unknown;
}

/**
 * Handler function for a tool
 */
export type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResponse>;

/**
 * A module that provides a set of related tools
 */
export interface HandlerModule {
  /** Tool definitions for ListTools */
  tools: ToolDefinition[];

  /** Creates handler functions bound to the client */
  createHandlers: (client: BitbucketClient) => Record<string, ToolHandler>;

  /** Tool names that require BITBUCKET_ENABLE_DANGEROUS=true */
  dangerousTools?: string[];
}
