import {
  apiRequest,
} from "../api/apiClient.js";

export const accountDashboardService = {
  getDashboard() {
    return apiRequest(
      "/account/dashboard"
    );
  },

  saveProgress(
    resourceId,
    progress
  ) {
    return apiRequest(
      `/account/progress/${resourceId}`,
      {
        method:
          "PATCH",

        body: {
          progress,
        },
      }
    );
  },

  getDownload(
    resourceId
  ) {
    return apiRequest(
      `/account/resources/${resourceId}/download`
    );
  },

  getReaderResource(
    slug
  ) {
    return apiRequest(
      `/account/resources/slug/${encodeURIComponent(
        slug
      )}/reader`
    );
  },
};
