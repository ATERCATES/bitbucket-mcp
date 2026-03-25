import { describe, it, expect, vi } from "vitest";
import { repositoriesModule } from "../../src/handlers/repositories.js";
import { createMockClient } from "../test-utils.js";

describe("repositoriesModule", () => {
  it("listRepositories fetches repositories", async () => {
    const { client, mockPaginator } = createMockClient();
    const handlers = repositoriesModule.createHandlers(client);

    mockPaginator.fetchValues.mockResolvedValue({ values: [{ name: "repo1" }] });

    const result = await handlers.listRepositories({ workspace: "ws1" });

    expect(mockPaginator.fetchValues).toHaveBeenCalledWith(
      "/repositories/ws1",
      expect.objectContaining({ description: "listRepositories" })
    );
    expect(JSON.parse(result.content[0].text)).toEqual([{ name: "repo1" }]);
  });

  it("getRepository fetches repository details", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = repositoriesModule.createHandlers(client);

    (mockApi.get as any).mockResolvedValue({ data: { name: "repo1" } });

    const result = await handlers.getRepository({
      workspace: "ws1",
      repo_slug: "repo1",
    });

    expect(mockApi.get).toHaveBeenCalledWith("/repositories/ws1/repo1");
    expect(JSON.parse(result.content[0].text)).toEqual({ name: "repo1" });
  });

  it("getEffectiveDefaultReviewers fetches reviewers", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = repositoriesModule.createHandlers(client);

    (mockApi.get as any).mockResolvedValue({ data: { values: [] } });

    const result = await handlers.getEffectiveDefaultReviewers({
      workspace: "ws1",
      repo_slug: "repo1",
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/effective-default-reviewers"
    );
    expect(JSON.parse(result.content[0].text)).toEqual({ values: [] });
  });
});
