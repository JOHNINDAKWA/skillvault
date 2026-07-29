import {
  apiRequest,
} from "../api/apiClient.js";

function checkoutHeaders(
  checkoutToken
) {
  return {
    "X-Checkout-Token":
      checkoutToken,
  };
}

function orderHeaders(
  orderToken
) {
  return {
    "X-Order-Token":
      orderToken,
  };
}

export const checkoutService = {
  startSession(details) {
    return apiRequest(
      "/checkout/sessions",
      {
        method:
          "POST",

        body:
          details,

        skipRefresh:
          true,
      }
    );
  },

  saveProgress(
    sessionId,
    checkoutToken,
    updates
  ) {
    return apiRequest(
      `/checkout/sessions/${sessionId}`,
      {
        method:
          "PATCH",

        headers:
          checkoutHeaders(
            checkoutToken
          ),

        body:
          updates,

        skipRefresh:
          true,
      }
    );
  },

  trackEvent(
    sessionId,
    checkoutToken,
    event
  ) {
    return apiRequest(
      `/checkout/sessions/${sessionId}/events`,
      {
        method:
          "POST",

        headers:
          checkoutHeaders(
            checkoutToken
          ),

        body:
          event,

        skipRefresh:
          true,
      }
    );
  },

  initiatePayment(
    sessionId,
    checkoutToken,
    details
  ) {
    return apiRequest(
      `/checkout/sessions/${sessionId}/payment`,
      {
        method:
          "POST",

        headers:
          checkoutHeaders(
            checkoutToken
          ),

        body:
          details,

        skipRefresh:
          true,
      }
    );
  },

  getOrderStatus(
    orderId,
    orderToken
  ) {
    return apiRequest(
      `/checkout/orders/${orderId}/status`,
      {
        headers:
          orderHeaders(
            orderToken
          ),

        skipRefresh:
          true,
      }
    );
  },

  getDownloads(
    orderId,
    orderToken
  ) {
    return apiRequest(
      `/checkout/orders/${orderId}/downloads`,
      {
        headers:
          orderHeaders(
            orderToken
          ),

        skipRefresh:
          true,
      }
    );
  },
};
