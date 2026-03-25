import { describe, it, expect, vi } from "vitest";
import { prContentModule } from "../../src/handlers/pr-content.js";
import { createMockClient } from "../test-utils.js";

describe("prContentModule", () => {
  it("getPullRequestDiff fetches diff", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = prContentModule.createHandlers(client);

    (mockApi.get as any).mockResolvedValue({ data: "diff content" });

    const result = await handlers.getPullRequestDiff({
      workspace: "ws1",
      repo_slug: "repo1",
      pull_request_id: "1",
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests/1/diff",
      expect.objectContaining({ headers: { Accept: "text/plain" } })
    );
    expect(result.content[0].text).toBe("diff content");
  });

  it("getPullRequestCommits fetches commits", async () => {
    const { client, mockPaginator } = createMockClient();
    const handlers = prContentModule.createHandlers(client);

    mockPaginator.fetchValues.mockResolvedValue({ values: [{ hash: "123" }] });

    const result = await handlers.getPullRequestCommits({
      workspace: "ws1",
      repo_slug: "repo1",
      pull_request_id: "1",
    });

    expect(mockPaginator.fetchValues).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests/1/commits",
      expect.anything()
    );
    expect(JSON.parse(result.content[0].text)).toEqual([{ hash: "123" }]);
  });
});
