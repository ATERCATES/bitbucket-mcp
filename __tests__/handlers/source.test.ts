import { describe, it, expect, vi } from "vitest";
import { sourceModule } from "../../src/handlers/source.js";
import { createMockClient } from "../test-utils.js";

describe("sourceModule", () => {
  it("getFileContent fetches text content", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = sourceModule.createHandlers(client);

    (mockApi.get as any).mockResolvedValue({ data: "file content" });

    const result = await handlers.getFileContent({
      workspace: "ws1",
      repo_slug: "repo1",
      path: "README.md",
      commit: "main",
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/src/main/README.md",
      expect.objectContaining({ headers: { Accept: "text/plain" } })
    );
    expect(result.content[0].text).toBe("file content");
  });
});
