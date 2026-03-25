import { describe, it, expect, vi } from "vitest";
import { pipelinesModule } from "../../src/handlers/pipelines.js";
import { createMockClient } from "../test-utils.js";

describe("pipelinesModule", () => {
  it("listPipelineRuns fetches runs", async () => {
    const { client, mockPaginator } = createMockClient();
    const handlers = pipelinesModule.createHandlers(client);

    mockPaginator.fetchValues.mockResolvedValue({ values: [{ uuid: "run1" }] });

    const result = await handlers.listPipelineRuns({
      workspace: "ws1",
      repo_slug: "repo1",
    });

    expect(mockPaginator.fetchValues).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pipelines",
      expect.anything()
    );
    expect(JSON.parse(result.content[0].text)).toEqual([{ uuid: "run1" }]);
  });

  it("runPipeline triggers new run", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = pipelinesModule.createHandlers(client);

    (mockApi.post as any).mockResolvedValue({ data: { uuid: "run1" } });

    const result = await handlers.runPipeline({
      workspace: "ws1",
      repo_slug: "repo1",
      target: {
        ref_type: "branch",
        ref_name: "main",
      },
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pipelines",
      expect.objectContaining({
        target: {
          ref_type: "branch",
          ref_name: "main",
          type: "pipeline_ref_target",
        },
      })
    );
  });

  it("stopPipeline calls stop endpoint", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = pipelinesModule.createHandlers(client);

    (mockApi.post as any).mockResolvedValue({ data: {} });

    await handlers.stopPipeline({
      workspace: "ws1",
      repo_slug: "repo1",
      pipeline_uuid: "uuid-1",
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/repositories/ws1/repo1/pipelines/uuid-1/stopPipeline"
    );
  });
});
