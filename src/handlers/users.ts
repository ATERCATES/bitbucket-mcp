import { HandlerModule } from "./types.js";
import { PAGINATION_BASE_SCHEMA, PAGINATION_ALL_SCHEMA } from "../schemas.js";
import { jsonResponse } from "../utils.js";

export const usersModule: HandlerModule = {
  tools: [
    {
      name: "getCurrentUser",
      description: "Get the currently authenticated Bitbucket user",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "listWorkspaces",
      description: "List Bitbucket workspaces the user has access to",
      inputSchema: {
        type: "object",
        properties: {
          ...PAGINATION_BASE_SCHEMA,
          all: PAGINATION_ALL_SCHEMA,
        },
      },
    },
  ],
  createHandlers: (client) => ({
    getCurrentUser: async () => {
      const response = await client.api.get("/user");
      return jsonResponse(response.data);
    },
    listWorkspaces: async (args) => {
      const result = await client.paginator.fetchValues("/workspaces", {
        pagelen: args.pagelen as number,
        page: args.page as number,
        all: args.all as boolean,
        description: "listWorkspaces",
      });
      return jsonResponse(result.values);
    },
  }),
};
