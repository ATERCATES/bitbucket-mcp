import { describe, it, expect, vi } from "vitest";
import { refsModule } from "../../src/handlers/refs.js";
import { createMockClient } from "../test-utils.js";

describe("refsModule", () => {
  it("listBranches fetches branches", async () => {
    const { client, mockPaginator } = createMockClient();
    const handlers = refsModule.createHandlers(client);

    mockPaginator.fetchValues.mockResolvedValue({ values: [{ name: "main" }] });

    const result = await handlers.listBranches({
      workspace: "ws1",
      repo_slug: "repo1",
    });

    expect(mockPaginator.fetchValues).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/refs/branches",
      expect.anything()
    );
    expect(JSON.parse(result.content[0].text)).toEqual([{ name: "main" }]);
  });

  it("createBranch posts new branch", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = refsModule.createHandlers(client);

    (mockApi.post as any).mockResolvedValue({ data: { name: "feature" } });

    const result = await handlers.createBranch({
      workspace: "ws1",
      repo_slug: "repo1",
      name: "feature",
      target: { hash: "123" },
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/refs/branches",
      { name: "feature", target: { hash: "123" } }
    );
    expect(JSON.parse(result.content[0].text)).toEqual({ name: "feature" });
  });

  it("deleteTag deletes a tag", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = refsModule.createHandlers(client);

    (mockApi.delete as any).mockResolvedValue({});

    await handlers.deleteTag({
      workspace: "ws1",
      repo_slug: "repo1",
      name: "v1.0",
    });

    expect(mockApi.delete).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/refs/tags/v1.0"
    );
  });
});
