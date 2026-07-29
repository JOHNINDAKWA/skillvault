const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

export class ApiClientError extends Error {
  constructor(
    message,
    status,
    details = null
  ) {
    super(message);

    this.name =
      "ApiClientError";

    this.status =
      status;

    this.details =
      details;
  }
}

async function parseResponse(
  response
) {
  const responseText =
    await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(
      responseText
    );
  } catch {
    return {
      success:
        response.ok,

      message:
        responseText,
    };
  }
}

async function refreshAuthenticationSession() {
  return fetch(
    `${API_BASE_URL}/auth/refresh`,
    {
      method: "POST",
      credentials: "include",
    }
  );
}

export async function apiRequest(
  path,
  {
    method = "GET",
    body,
    headers = {},
    skipRefresh = false,
  } = {}
) {
  const isFormData =
    typeof FormData !==
      "undefined" &&
    body instanceof FormData;

  const makeRequest =
    () =>
      fetch(
        `${API_BASE_URL}${path}`,
        {
          method,
          credentials:
            "include",

          headers: {
            ...(
              body &&
              !isFormData
                ? {
                    "Content-Type":
                      "application/json",
                  }
                : {}
            ),

            ...headers,
          },

          body:
            body
              ? isFormData
                ? body
                : JSON.stringify(
                    body
                  )
              : undefined,
        }
      );

  let response;

  try {
    response =
      await makeRequest();
  } catch {
    throw new ApiClientError(
      "Unable to reach the SkillVault server. Confirm that the backend is running.",
      0
    );
  }

  const canAttemptRefresh =
    response.status === 401 &&
    !skipRefresh &&
    path !==
      "/auth/refresh" &&
    path !==
      "/auth/login" &&
    path !==
      "/auth/register";

  if (canAttemptRefresh) {
    try {
      const refreshResponse =
        await refreshAuthenticationSession();

      if (
        refreshResponse.ok
      ) {
        response =
          await makeRequest();
      }
    } catch {
      // The original unauthorized response is handled below.
    }
  }

  const payload =
    await parseResponse(
      response
    );

  if (!response.ok) {
    throw new ApiClientError(
      payload?.message ||
        "The request could not be completed.",

      response.status,

      payload?.details ||
        null
    );
  }

  return payload;
}
