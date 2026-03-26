import { ToolDefinition, ToolHandler, HandlerModule } from "./types.js";
import { BitbucketClient } from "../client.js";
import { logger } from "../logger.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const tools: ToolDefinition[] = [{
  name: "bitbucket_api_request",
  description: "Make an authenticated GET request to the Bitbucket Cloud API. Use this tool for endpoints not covered by other specific tools, or to access raw API data. The response is returned as a JSON string.",
  inputSchema: {
    type: "object",
    properties: {
      endpoint: {
        type: "string",
        description: "API endpoint path (e.g. '/repositories/workspace/repo') or full URL. If relative, it's appended to the base URL.",
      },
      params: {
        type: "object",
        description: "Optional query parameters as key-value pairs (e.g. { 'q': 'name~\"test\"', 'sort': '-updated_on' }).",
      },
    },
    required: ["endpoint"],
  },
}];

const createHandlers = (client: BitbucketClient): Record<string, ToolHandler> => ({
  bitbucket_api_request: async (args: Record<string, unknown>) => {
    const endpoint = args.endpoint as string;
    const params = (args.params as Record<string, unknown>) || {};

    try {
      logger.info("Executing generic API request", { endpoint, params });
      
      const response = await client.api.get(endpoint, { params });
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      logger.error("Error executing generic API request", { error, endpoint });
      
      if (axios.isAxiosError(error) && error.response) {
          // Return API error details without throwing, so the LLM can see the 4xx/5xx response
          return {
              content: [{ 
                  type: "text", 
                  text: `API Error ${error.response.status}: ${JSON.stringify(error.response.data, null, 2)}` 
              }],
              isError: true,
          };
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to execute API request: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});

export const genericModule: HandlerModule = {
  tools,
  createHandlers,
};
