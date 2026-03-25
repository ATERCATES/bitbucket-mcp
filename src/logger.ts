import winston from "winston";
import os from "os";
import path from "path";
import fs from "fs";

// =========== LOGGER SETUP ==========
// File-based logging with sensible defaults and ability to disable
function getDefaultLogDirectory(): string {
  if (process.platform === "win32") {
    const base = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
    return path.join(base, "bitbucket-mcp");
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Logs", "bitbucket-mcp");
  }
  const xdgStateHome = process.env.XDG_STATE_HOME;
  if (xdgStateHome && xdgStateHome.length > 0) {
    return path.join(xdgStateHome, "bitbucket-mcp");
  }
  return path.join(os.homedir(), ".local", "state", "bitbucket-mcp");
}

export function isTruthyEnv(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  const normalized = String(value).toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function getLogFilePath(): string | undefined {
  if (isTruthyEnv(process.env.BITBUCKET_LOG_DISABLE)) {
    return undefined;
  }

  const explicitFile = process.env.BITBUCKET_LOG_FILE;
  if (explicitFile && explicitFile.trim().length > 0) {
    return explicitFile;
  }

  const baseDir =
    process.env.BITBUCKET_LOG_DIR && process.env.BITBUCKET_LOG_DIR.trim().length > 0
      ? (process.env.BITBUCKET_LOG_DIR as string)
      : getDefaultLogDirectory();

  let effectiveDir = baseDir as string;
  if (isTruthyEnv(process.env.BITBUCKET_LOG_PER_CWD)) {
    const sanitizedCwd = process
      .cwd()
      .replace(/[\\/]/g, "_")
      .replace(/[:*?"<>|]/g, "");
    effectiveDir = path.join(baseDir as string, sanitizedCwd);
  }

  try {
    fs.mkdirSync(effectiveDir, { recursive: true });
  } catch {
    return undefined; // If we cannot create the directory, disable file logging rather than polluting CWD
  }

  return path.join(effectiveDir, "bitbucket.log");
}

const resolvedLogFile = getLogFilePath();
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: resolvedLogFile ? [new winston.transports.File({ filename: resolvedLogFile })] : [],
});
