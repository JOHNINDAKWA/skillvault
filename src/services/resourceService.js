import { apiRequest } from "../api/apiClient.js";

export const resourceService = {
  listPublished() {
    return apiRequest("/resources", {
      skipRefresh: true,
    });
  },

  getPublished(slug) {
    return apiRequest(`/resources/${encodeURIComponent(slug)}`, {
      skipRefresh: true,
    });
  },
};
