import {
  apiRequest,
} from "../api/apiClient.js";

export const adminOrderService = {
  listJourneys() {
    return apiRequest(
      "/admin/orders"
    );
  },

  refreshOrder(
    orderId
  ) {
    return apiRequest(
      `/admin/orders/${orderId}/refresh`,
      {
        method:
          "POST",
      }
    );
  },
};
