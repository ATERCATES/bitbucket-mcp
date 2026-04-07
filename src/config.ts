import type { BitbucketConfig, BitbucketMode } from "./types.js";

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
 * Parse comma-separated list of tool names from env var
 */
function parseToolList(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Load Bitbucket configuration from environment variables.
 * Reads all relevant BITBUCKET_* env vars and returns a normalized config.
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - BITBUCKET_USERNAME: Your Atlassian email address
 * - BITBUCKET_API_TOKEN: Personal API Token (must start with ATBB- or ATATT-)
 * 
 * OPTIONAL:
 * - BITBUCKET_WORKSPACE: Default workspace name
 * - BITBUCKET_URL: API base URL (default: https://api.bitbucket.org/2.0)
 * - BITBUCKET_MODE: Operation mode - readonly, safe (default), or full
 * - BITBUCKET_ENABLED_TOOLS: Comma-separated list of tools to enable
 * - BITBUCKET_DISABLED_TOOLS: Comma-separated list of tools to disable
 */
export function loadConfigFromEnv(): BitbucketConfig {
  // Determine mode
  let mode: BitbucketMode = "safe"; // default
  const modeEnv = process.env.BITBUCKET_MODE?.toLowerCase();
  
  if (modeEnv === "readonly" || modeEnv === "safe" || modeEnv === "full") {
    mode = modeEnv;
  }

  const initialConfig: BitbucketConfig = {
    baseUrl: process.env.BITBUCKET_URL || "https://api.bitbucket.org/2.0",
    token: process.env.BITBUCKET_API_TOKEN,
    username: process.env.BITBUCKET_USERNAME,
    defaultWorkspace: process.env.BITBUCKET_WORKSPACE,
    mode,
    enabledTools: parseToolList(process.env.BITBUCKET_ENABLED_TOOLS),
    disabledTools: parseToolList(process.env.BITBUCKET_DISABLED_TOOLS),
  };

  return normalizeBitbucketConfig(initialConfig);
}
