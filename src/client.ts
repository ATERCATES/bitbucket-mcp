import axios, { AxiosInstance } from "axios";
import { BitbucketPaginator } from "./pagination.js";
import { BitbucketConfig } from "./types.js";
import { logger } from "./logger.js";

/**
 * Bitbucket API client that wraps axios and provides paginator support
 */
export class BitbucketClient {
  readonly api: AxiosInstance;
  readonly config: BitbucketConfig;
  readonly paginator: BitbucketPaginator;

  constructor(config: BitbucketConfig) {
    this.config = config;

    // Setup Axios instance
    const headers: Record<string, string> = {};
    if (config.token) {
      headers.Authorization = `Bearer ${config.token}`;
    }

    this.api = axios.create({
      baseURL: config.baseUrl,
      headers,
      auth:
        config.username && config.password
          ? { username: config.username, password: config.password }
          : undefined,
    });

    this.paginator = new BitbucketPaginator(this.api, logger);
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
