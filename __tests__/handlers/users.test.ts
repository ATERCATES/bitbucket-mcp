import { describe, it, expect, vi } from "vitest";
import { usersModule } from "../../src/handlers/users.js";
import { createMockClient } from "../test-utils.js";

describe("usersModule", () => {
  it("getCurrentUser fetches user info", async () => {
    const { client, mockApi } = createMockClient();
    const handlers = usersModule.createHandlers(client);

    (mockApi.get as any).mockResolvedValue({ data: { display_name: "Test User" } });

    const result = await handlers.getCurrentUser({});

    expect(mockApi.get).toHaveBeenCalledWith("/user");
    expect(JSON.parse(result.content[0].text)).toEqual({
      display_name: "Test User",
    });
  });

  it("listWorkspaces fetches workspaces", async () => {
    const { client, mockPaginator } = createMockClient();
    const handlers = usersModule.createHandlers(client);

    mockPaginator.fetchValues.mockResolvedValue({ values: [{ slug: "ws1" }] });

    const result = await handlers.listWorkspaces({});

    expect(mockPaginator.fetchValues).toHaveBeenCalledWith(
      "/workspaces",
      expect.objectContaining({ description: "listWorkspaces" })
    );
    expect(JSON.parse(result.content[0].text)).toEqual([{ slug: "ws1" }]);
  });
});
