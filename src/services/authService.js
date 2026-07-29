import {
  apiRequest,
} from "../api/apiClient.js";

export const authService = {
  register(details) {
    return apiRequest(
      "/auth/register",
      {
        method: "POST",
        body: details,
        skipRefresh: true,
      }
    );
  },

  login(credentials) {
    return apiRequest(
      "/auth/login",
      {
        method: "POST",
        body: credentials,
        skipRefresh: true,
      }
    );
  },

  adoptSession(tokens) {
    return apiRequest(
      "/auth/adopt-session",
      {
        method: "POST",
        body: tokens,
        skipRefresh: true,
      }
    );
  },

  verifyInvite(tokenHash) {
    return apiRequest(
      "/auth/verify-invite",
      {
        method: "POST",
        body: {
          tokenHash,
        },
        skipRefresh: true,
      }
    );
  },

  updatePassword(password) {
    return apiRequest(
      "/auth/password",
      {
        method: "PATCH",
        body: {
          password,
        },
      }
    );
  },

  getCurrentUser() {
    return apiRequest(
      "/auth/me"
    );
  },

  updateProfile(updates) {
    return apiRequest(
      "/users/me",
      {
        method: "PATCH",
        body: updates,
      }
    );
  },

  logout() {
    return apiRequest(
      "/auth/logout",
      {
        method: "POST",
        skipRefresh: true,
      }
    );
  },
};
