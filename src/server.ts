import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { BitbucketClient } from "./client.js";
import { BitbucketConfig } from "./types.js";
import { loadConfigFromEnv } from "./config.js";
import { logger } from "./logger.js";
import { allModules } from "./handlers/index.js";
import { ToolDefinition, ToolHandler } from "./handlers/types.js";

/**
 * Bitbucket MCP Server with modular handlers
 */
export class BitbucketMcpServer {
  private readonly server: Server;
  private readonly client: BitbucketClient;
  private readonly config: BitbucketConfig;
  private readonly toolHandlers: Map<string, ToolHandler> = new Map();
  private readonly toolDefinitions: ToolDefinition[] = [];
  private readonly dangerousToolNames: Set<string> = new Set();

  constructor(config: BitbucketConfig) {
    this.config = config;
    this.client = new BitbucketClient(config);

    this.server = new Server(
      {
        name: "bitbucket-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.registerHandlers();
    this.setupToolRouting();

    this.server.onerror = (error) => logger.error("[MCP Error]", error);
  }

  /**
   * Register all handler modules with filtering based on mode and tool lists
   */
  private registerHandlers(): void {
    for (const module of allModules) {
      // Collect dangerous tool names
      if (module.dangerousTools) {
        for (const name of module.dangerousTools) {
          this.dangerousToolNames.add(name);
        }
      }

      // Filter tools based on mode, dangerous flag, and enabled/disabled lists
      for (const tool of module.tools) {
        if (!this.shouldEnableTool(tool.name)) {
          logger.info(`Skipping tool: ${tool.name} (filtered by config)`);
          continue;
        }
        this.toolDefinitions.push(tool);
      }

      // Create handlers
      const handlers = module.createHandlers(this.client);
      for (const [name, handler] of Object.entries(handlers)) {
        if (!this.shouldEnableTool(name)) {
          continue;
        }
        this.toolHandlers.set(name, handler);
      }
    }

    logger.info(`Registered ${this.toolDefinitions.length} tools (mode: ${this.config.mode || 'safe'})`);
  }

  /**
   * Determine if a tool should be enabled based on mode and configuration
   */
  private shouldEnableTool(toolName: string): boolean {
    const { mode = "safe", enabledTools, disabledTools } = this.config;
    
    // If enabledTools is specified, ONLY enable those tools (whitelist mode)
    if (enabledTools && enabledTools.length > 0) {
      return enabledTools.includes(toolName);
    }
    
    // If disabledTools is specified, disable those tools (blacklist mode)
    if (disabledTools && disabledTools.includes(toolName)) {
      return false;
    }
    
    const isDangerous = this.isDangerousTool(toolName);
    const isWriteOperation = this.isWriteOperation(toolName);
    
    // Filter based on mode
    switch (mode) {
      case "readonly":
        // Only allow GET operations (no create, update, delete, merge, approve, etc.)
        return !isWriteOperation;
        
      case "safe":
        // Allow GET + POST/PUT, but no dangerous operations
        return !isDangerous;
        
      case "full":
        // Allow everything
        return true;
        
      default:
        return !isDangerous; // fallback to safe mode
    }
  }
  
  /**
   * Check if a tool is a write operation (POST/PUT/DELETE)
   */
  private isWriteOperation(name: string): boolean {
    // Delete operations
    if (/^delete/i.test(name)) return true;
    
    // Create operations (POST)
    if (/^create/i.test(name)) return true;
    
    // Update operations (PUT)
    if (/^update/i.test(name)) return true;
    
    // Approval/decline operations
    if (/^(approve|unapprove|decline|merge)/i.test(name)) return true;
    
    // Run/trigger operations
    if (/^(run|trigger|stop)/i.test(name)) return true;
    
    // Any operation that modifies state
    if (/^(add|remove|set)/i.test(name)) return true;
    
    return false;
  }

  /**
   * Check if a tool is considered dangerous
   */
  private isDangerousTool(name: string): boolean {
    if (this.dangerousToolNames.has(name)) return true;
    if (/^delete/i.test(name)) return true;
    return false;
  }

  /**
   * Setup MCP tool routing
   */
  private setupToolRouting(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.toolDefinitions,
    }));

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      logger.info(`Tool called: ${name}`, { args });

      const handler = this.toolHandlers.get(name);
      if (!handler) {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }

      try {
        return await handler(args ?? {});
      } catch (error) {
        logger.error("Tool execution error", { error, tool: name });
        if (axios.isAxiosError(error)) {
          throw new McpError(
            ErrorCode.InternalError,
            `Bitbucket API error: ${error.response?.data?.message ?? error.message}`
          );
        }
        throw error;
      }
    });
  }

  /**
   * Start the server with stdio transport
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info("Bitbucket MCP server running on stdio");
  }
}

/**
 * Create and run server from environment config
 */
export async function main(): Promise<void> {
  try {
    const config = loadConfigFromEnv();
    const server = new BitbucketMcpServer(config);
    await server.run();
  } catch (error) {
    logger.error("Server startup error", { error });
    process.exit(1);
  }
}
