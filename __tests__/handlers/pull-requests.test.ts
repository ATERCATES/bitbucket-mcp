import { describe, it, expect, vi } from "vitest";
import { pullRequestsModule } from "../../src/handlers/pull-requests.js";
import { createMockClient } from "../test-utils.js";

describe("pullRequestsModule", () => {
  it("getPullRequests fetches PRs", async () => {
    const { client, mockPaginator } = createMockClient();
    const handlers = pullRequestsModule.createHandlers(client);

    mockPaginator.fetchValues.mockResolvedValue({ values: [{ id: 1 }] });

    const result = await handlers.getPullRequests({
      workspace: "ws1",
      repo_slug: "repo1",
    });

    expect(mockPaginator.fetchValues).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests",
      expect.anything()
    );
    expect(JSON.parse(result.content[0].text)).toEqual([{ id: 1 }]);
  });

  it("createPullRequest posts new PR", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = pullRequestsModule.createHandlers(client);

    (mockApi.post as any).mockResolvedValue({ data: { id: 1 } });

    const result = await handlers.createPullRequest({
      workspace: "ws1",
      repo_slug: "repo1",
      title: "New PR",
      sourceBranch: "feature",
      targetBranch: "main",
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests",
      expect.objectContaining({
        title: "New PR",
        description: undefined,
        source: {
          branch: {
            name: "feature",
          },
        },
        destination: {
          branch: {
            name: "main",
          },
        },
        close_source_branch: true,
      })
    );
    expect(JSON.parse(result.content[0].text)).toEqual({ id: 1 });
  });

  it("updatePullRequest sends patch", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = pullRequestsModule.createHandlers(client);

    (mockApi.put as any).mockResolvedValue({ data: { id: 1, title: "Updated" } });

    const result = await handlers.updatePullRequest({
      workspace: "ws1",
      repo_slug: "repo1",
      pull_request_id: "1",
      title: "Updated",
      reviewers: ["uuid-1"],
      close_source_branch: false,
    });

    expect(mockApi.put).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests/1",
      expect.objectContaining({
        title: "Updated",
        reviewers: [{ uuid: "uuid-1" }],
        close_source_branch: false,
      })
    );
  });

  it("requestChanges sends POST", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = pullRequestsModule.createHandlers(client);

    (mockApi.post as any).mockResolvedValue({});

    await handlers.requestChanges({
      workspace: "ws1",
      repo_slug: "repo1",
      pull_request_id: "1",
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests/1/request-changes"
    );
  });
});
