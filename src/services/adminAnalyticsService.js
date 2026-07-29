import {
  apiRequest,
} from "../api/apiClient.js";

export const adminAnalyticsService = {
  getAnalytics() {
    return apiRequest(
      "/admin/analytics"
    );
  },
};
