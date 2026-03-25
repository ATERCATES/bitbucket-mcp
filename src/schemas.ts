import {
  BITBUCKET_ALL_ITEMS_CAP,
  BITBUCKET_DEFAULT_PAGELEN,
  BITBUCKET_MAX_PAGELEN,
} from "./pagination.js";

export const PAGINATION_BASE_SCHEMA = {
  pagelen: {
    type: "number",
    minimum: 1,
    maximum: BITBUCKET_MAX_PAGELEN,
    description: `Number of items per page (Bitbucket pagelen). Defaults to ${BITBUCKET_DEFAULT_PAGELEN} and caps at ${BITBUCKET_MAX_PAGELEN}.`,
  },
  page: {
    type: "number",
    minimum: 1,
    description: "Bitbucket page number to fetch (1-based).",
  },
};

export const PAGINATION_ALL_SCHEMA = {
  type: "boolean",
  description: `When true (and no page is provided), automatically follows Bitbucket next links to return all items up to ${BITBUCKET_ALL_ITEMS_CAP}.`,
};

export const LEGACY_LIMIT_SCHEMA = {
  type: "number",
  description: "Deprecated alias for pagelen. Use pagelen/page/all for pagination control.",
};
