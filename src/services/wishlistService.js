import {
  apiRequest,
} from "../api/apiClient.js";

export const wishlistService = {
  listWishlist() {
    return apiRequest(
      "/wishlist"
    );
  },

  addResource(
    resourceId
  ) {
    return apiRequest(
      `/wishlist/${resourceId}`,
      {
        method: "POST",
      }
    );
  },

  removeResource(
    resourceId
  ) {
    return apiRequest(
      `/wishlist/${resourceId}`,
      {
        method: "DELETE",
      }
    );
  },
};
