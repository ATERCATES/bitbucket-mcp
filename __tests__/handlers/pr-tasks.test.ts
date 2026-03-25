import { describe, it, expect, vi } from "vitest";
import { prTasksModule } from "../../src/handlers/pr-tasks.js";
import { createMockClient } from "../test-utils.js";

describe("prTasksModule", () => {
  it("getPullRequestTasks fetches tasks", async () => {
    const { client, mockPaginator } = createMockClient();
    const handlers = prTasksModule.createHandlers(client);

    mockPaginator.fetchValues.mockResolvedValue({ values: [{ id: 1 }] });

    const result = await handlers.getPullRequestTasks({
      workspace: "ws1",
      repo_slug: "repo1",
      pull_request_id: "1",
    });

    expect(mockPaginator.fetchValues).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests/1/tasks",
      expect.anything()
    );
    expect(JSON.parse(result.content[0].text)).toEqual([{ id: 1 }]);
  });

  it("createPullRequestTask creates task", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = prTasksModule.createHandlers(client);

    (mockApi.post as any).mockResolvedValue({ data: { id: 1 } });

    const result = await handlers.createPullRequestTask({
      workspace: "ws1",
      repo_slug: "repo1",
      pull_request_id: "1",
      content: "Do it",
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests/1/tasks",
      { content: { raw: "Do it" } }
    );
    expect(JSON.parse(result.content[0].text)).toEqual({ id: 1 });
  });

  it("deletePullRequestTask deletes task", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = prTasksModule.createHandlers(client);

    (mockApi.delete as any).mockResolvedValue({});

    await handlers.deletePullRequestTask({
      workspace: "ws1",
      repo_slug: "repo1",
      pull_request_id: "1",
      task_id: "100",
    });

    expect(mockApi.delete).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pullrequests/1/tasks/100"
    );
  });
});
