import type { BitbucketConfig } from "./types.js";
import { isTruthyEnv } from "./logger.js";

/**
 * Normalize Bitbucket configuration for backward compatibility and DX.
 * Handles URL normalization and workspace extraction from web URLs.
 */
export function normalizeBitbucketConfig(rawConfig: BitbucketConfig): BitbucketConfig {
  const normalizedConfig = { ...rawConfig };
  try {
    const parsed = new URL(rawConfig.baseUrl);
    const host = parsed.hostname.toLowerCase();

    // If users provide a web URL like https://bitbucket.org/<workspace>,
    // extract the workspace and switch to the public API base URL
    if (host === "bitbucket.org" || host === "www.bitbucket.org") {
      const segments = parsed.pathname.split("/").filter(Boolean);
      if (!normalizedConfig.defaultWorkspace && segments.length >= 1) {
        normalizedConfig.defaultWorkspace = segments[0];
      }
      normalizedConfig.baseUrl = "https://api.bitbucket.org/2.0";
    }

    // If users provide https://api.bitbucket.org (without /2.0), ensure /2.0
    if (host === "api.bitbucket.org") {
      const pathname = parsed.pathname.replace(/\/+$/, "");
      if (!pathname.startsWith("/2.0")) {
        normalizedConfig.baseUrl = "https://api.bitbucket.org/2.0";
      } else {
        normalizedConfig.baseUrl = "https://api.bitbucket.org/2.0";
      }
    }

    // Remove trailing slashes for a consistent axios baseURL
    normalizedConfig.baseUrl = normalizedConfig.baseUrl.replace(/\/+$/, "");
  } catch {
    // If baseUrl is not a valid absolute URL, keep as-is (custom/self-hosted cases)
  }

  return normalizedConfig;
}

/**
 * Load Bitbucket configuration from environment variables.
 * Reads all relevant BITBUCKET_* env vars and returns a normalized config.
 */
export function loadConfigFromEnv(): BitbucketConfig {
  const initialConfig: BitbucketConfig = {
    baseUrl: process.env.BITBUCKET_URL || "https://api.bitbucket.org/2.0",
    token: process.env.BITBUCKET_TOKEN,
    username: process.env.BITBUCKET_USERNAME,
    password: process.env.BITBUCKET_PASSWORD,
    defaultWorkspace: process.env.BITBUCKET_WORKSPACE,
    allowDangerousCommands:
      isTruthyEnv(process.env.BITBUCKET_ENABLE_DANGEROUS) ||
      isTruthyEnv(process.env.BITBUCKET_ALLOW_DANGEROUS),
  };

  return normalizeBitbucketConfig(initialConfig);
}
