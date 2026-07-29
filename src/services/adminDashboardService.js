import {
  apiRequest,
} from "../api/apiClient.js";

export const adminDashboardService = {
  getDashboard() {
    return apiRequest(
      "/admin/dashboard"
    );
  },
};
