import { vi } from "vitest";
import type { AxiosInstance } from "axios";
import { BitbucketClient } from "../src/client.js";

export const createMockClient = () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  } as unknown as AxiosInstance;

  const mockPaginator = {
    fetchValues: vi.fn(),
  };

  const client = {
    api: mockApi,
    paginator: mockPaginator,
    resolveWorkspace: vi.fn((ws) => ws || "default-workspace"),
    config: { defaultWorkspace: "default-workspace" },
  } as unknown as BitbucketClient;

  return { client, mockApi, mockPaginator };
};
