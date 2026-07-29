import {
  apiRequest,
} from "../api/apiClient.js";

export const adminCustomerService = {
  listCustomers() {
    return apiRequest(
      "/admin/customers"
    );
  },
};
