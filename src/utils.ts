/**
 * Wraps data in MCP tool response format with JSON content
 */
export function jsonResponse(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Wraps text in MCP tool response format
 */
export function textResponse(text: string) {
  return {
    content: [{ type: "text" as const, text }],
  };
}
