import {
  apiRequest,
} from "../api/apiClient.js";

const API_BASE_URL =
  import.meta.env
    .VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

async function readErrorMessage(
  response
) {
  try {
    const payload =
      await response.json();

    return (
      payload.message ||
      "The receipt could not be downloaded."
    );
  } catch {
    return "The receipt could not be downloaded.";
  }
}

export const receiptService = {
  listReceipts() {
    return apiRequest(
      "/account/receipts"
    );
  },

  async downloadReceipt(
    orderId
  ) {
    const response =
      await fetch(
        `${API_BASE_URL}/account/receipts/${orderId}/download`,
        {
          method:
            "GET",

          credentials:
            "include",

          headers: {
            Accept:
              "application/pdf",
          },
        }
      );

    if (
      !response.ok
    ) {
      throw new Error(
        await readErrorMessage(
          response
        )
      );
    }

    return response.blob();
  },
};
