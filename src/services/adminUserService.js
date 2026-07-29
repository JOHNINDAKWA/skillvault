import { apiRequest } from "../api/apiClient.js";

export const adminUserService = {
  listUsers() {
    return apiRequest("/admin/users");
  },

  createUser(details) {
    return apiRequest("/admin/users", {
      method: "POST",
      body: details,
    });
  },

  updateRole(userId, role) {
    return apiRequest(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: {
        role,
      },
    });
  },

  updateStatus(userId, status) {
    return apiRequest(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: {
        status,
      },
    });
  },

  removeUser(userId) {
    return apiRequest(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  },
};