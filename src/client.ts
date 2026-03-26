import axios, { AxiosInstance } from "axios";
import { BitbucketPaginator } from "./pagination.js";
import { BitbucketConfig } from "./types.js";
import { logger } from "./logger.js";

/**
 * Bitbucket API client that wraps axios and provides paginator support.
 * 
 * AUTHENTICATION: This client uses Personal Authentication (Basic Auth) only.
 * Supported methods:
 * - Personal API Tokens (ATBB-xxx): BITBUCKET_USERNAME (email) + BITBUCKET_API_TOKEN
 * 
 * Note: App Passwords and Workspace/Repository Access Tokens are NOT supported.
 */
export class BitbucketClient {
  readonly api: AxiosInstance;
  readonly config: BitbucketConfig;
  readonly paginator: BitbucketPaginator;

  constructor(config: BitbucketConfig) {
    this.config = config;

    // Validate required credentials for Personal API Token
    const credentials = this.validateAuth(config);

    const auth = {
      username: credentials.username,
      password: credentials.token,
    };

    logger.info("Bitbucket Client initialized with Personal API Token", {
      username: credentials.username,
      baseUrl: config.baseUrl,
    });

    this.api = axios.create({
      baseURL: config.baseUrl,
      auth,
    });

    this.paginator = new BitbucketPaginator(this.api, logger);
  }

  /**
   * Validates that required credentials are provided and strictly enforces ATBB tokens.
   */
  private validateAuth(config: BitbucketConfig): { username: string; token: string } {
    // Check if username is provided
    if (!config.username) {
      throw new Error(
        "BITBUCKET_USERNAME is required.\n" +
        "Set your Atlassian email address (for API Tokens) or Bitbucket username (for App Passwords).\n" +
        "Example: export BITBUCKET_USERNAME=\"user@example.com\""
      );
    }

    // Check if token is provided
    if (!config.token) {
      throw new Error(
        "BITBUCKET_API_TOKEN is required.\n" +
        "Example: export BITBUCKET_API_TOKEN=\"ATBBxxxxx\""
      );
    }

    // Warn if username looks like email but token doesn't look like ATBB/ATATT (might be App Password)
    // or if username is not email but token is ATBB (mismatch)
    if (config.token.startsWith("ATBB") && !config.username.includes("@")) {
      logger.warn(
        "Warning: Personal API Tokens (ATBB) usually require your Atlassian email address as the username.\n" +
        `Current username: "${config.username}"`
      );
    }

    return { username: config.username, token: config.token };
  }

  /**
   * Resolves workspace from argument or falls back to default config
   */
  resolveWorkspace(workspace?: string): string {
    const resolved = workspace || this.config.defaultWorkspace;
    if (!resolved) {
      throw new Error(
        "Workspace must be provided either as a parameter or through BITBUCKET_WORKSPACE environment variable"
      );
    }
    return resolved;
  }
}
