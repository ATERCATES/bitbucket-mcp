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
    this.validateAuth(config);

    const auth = {
      username: config.username!,
      password: config.token!,
    };

    logger.info("Bitbucket Client initialized with Personal API Token", {
      username: config.username,
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
  private validateAuth(config: BitbucketConfig): void {
    // Check if username is provided
    if (!config.username) {
      throw new Error(
        "BITBUCKET_USERNAME is required.\n" +
        "Set your Atlassian email address.\n" +
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

    // Strict validation: Must start with ATBB or ATATT
    if (!config.token.startsWith("ATBB") && !config.token.startsWith("ATATT")) {
      throw new Error(
        "Invalid token format. Only Personal API Tokens starting with 'ATBB' or 'ATATT' are supported.\n" +
        "Please create a new API Token at https://bitbucket.org/account/settings/app-passwords/ (select 'Create API token')\n" +
        "App Passwords and Access Tokens (BBAT) are not supported.\n" +
        `Current token prefix: ${config.token.substring(0, 4)}...`
      );
    }

    // Warn if username doesn't look like an email
    if (!config.username.includes("@")) {
      logger.warn(
        "Warning: Personal API Tokens (ATBB) usually require your Atlassian email address as the username.\n" +
        `Current username: "${config.username}"`
      );
    }
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
