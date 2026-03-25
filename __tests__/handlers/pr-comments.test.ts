import { describe, it, expect, vi } from "vitest";
import { prCommentsModule } from "../../src/handlers/pr-comments.js";
import { createMockClient } from "../test-utils.js";

describe("prCommentsModule", () => {
  it("getPullRequestComments fetches comments", async () => {
    const { client, mockPaginator } = createMockClient();
    const handlers = prCommentsModule.createHandlers(client);

    mockPaginator.fetchValues.mockResolvedValue({ values: [{ id: 1 }] });

    const result = await handlers.getPullRequestComments({
      workspace: "ws1",
      repo_slug: "repo1",
      pull_request_id: "1",
    });

    expect(mockPaginator.fetchValues).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests/1/comments",
      expect.anything()
    );
    expect(JSON.parse(result.content[0].text)).toEqual([{ id: 1 }]);
  });

  it("addPullRequestComment posts comment", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = prCommentsModule.createHandlers(client);

    (mockApi.post as any).mockResolvedValue({ data: { id: 1 } });

    const result = await handlers.addPullRequestComment({
      workspace: "ws1",
      repo_slug: "repo1",
      pull_request_id: "1",
      content: "Nice work",
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests/1/comments",
      { content: { raw: "Nice work" } }
    );
    expect(JSON.parse(result.content[0].text)).toEqual({ id: 1 });
  });

  it("deletePullRequestComment deletes comment", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = prCommentsModule.createHandlers(client);

    (mockApi.delete as any).mockResolvedValue({});

    await handlers.deletePullRequestComment({
      workspace: "ws1",
      repo_slug: "repo1",
      pull_request_id: "1",
      comment_id: "100",
    });

    expect(mockApi.delete).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests/1/comments/100"
    );
  });
});
