import { describe, it, expect, vi } from "vitest";
import { branchingModelModule } from "../../src/handlers/branching-model.js";
import { createMockClient } from "../test-utils.js";

describe("branchingModelModule", () => {
  it("getRepositoryBranchingModel fetches model", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = branchingModelModule.createHandlers(client);

    (mockApi.get as any).mockResolvedValue({ data: { type: "model" } });

    const result = await handlers.getRepositoryBranchingModel({
      workspace: "ws1",
      repo_slug: "repo1",
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/branching-model"
    );
    expect(JSON.parse(result.content[0].text)).toEqual({ type: "model" });
  });

  it("getProjectBranchingModel fetches project model", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = branchingModelModule.createHandlers(client);

    (mockApi.get as any).mockResolvedValue({ data: { type: "project_model" } });

    const result = await handlers.getProjectBranchingModel({
      workspace: "ws1",
      project_key: "PROJ",
    });

    expect(mockApi.get).toHaveBeenCalledWith(
      "/workspaces/ws1/projects/PROJ/branching-model"
    );
    expect(JSON.parse(result.content[0].text)).toEqual({
      type: "project_model",
    });
  });
});
