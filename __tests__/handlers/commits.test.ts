import { describe, it, expect, vi } from "vitest";
import { commitsModule } from "../../src/handlers/commits.js";
import { createMockClient } from "../test-utils.js";

describe("commitsModule", () => {
  it("listCommits fetches commits", async () => {
    const { client, mockPaginator } = createMockClient();
    const handlers = commitsModule.createHandlers(client);

    mockPaginator.fetchValues.mockResolvedValue({ values: [{ hash: "123" }] });

    const result = await handlers.listCommits({
      workspace: "ws1",
      repo_slug: "repo1",
    });

    expect(mockPaginator.fetchValues).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/commits",
      expect.anything()
    );
    expect(JSON.parse(result.content[0].text)).toEqual([{ hash: "123" }]);
  });

  it("getCommit fetches commit details", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = commitsModule.createHandlers(client);

    (mockApi.get as any).mockResolvedValue({ data: { hash: "123", message: "init" } });

    const result = await handlers.getCommit({
      workspace: "ws1",
      repo_slug: "repo1",
      sha: "123",
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/commit/123"
    );
    expect(JSON.parse(result.content[0].text)).toEqual({
      hash: "123",
      message: "init",
    });
  });
});
