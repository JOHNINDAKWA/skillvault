import {
  apiRequest,
} from "../api/apiClient.js";

function createFileBody(file) {
  const body =
    new FormData();

  body.append(
    "file",
    file
  );

  return body;
}

export const adminResourceService = {
  listResources() {
    return apiRequest(
      "/admin/resources"
    );
  },

  getResource(slug) {
    return apiRequest(
      `/admin/resources/slug/${encodeURIComponent(
        slug
      )}`
    );
  },

  createResource(resource) {
    return apiRequest(
      "/admin/resources",
      {
        method: "POST",
        body: resource,
      }
    );
  },

  updateResource(
    resourceId,
    resource
  ) {
    return apiRequest(
      `/admin/resources/${resourceId}`,
      {
        method: "PATCH",
        body: resource,
      }
    );
  },

  deleteResource(
    resourceId
  ) {
    return apiRequest(
      `/admin/resources/${resourceId}`,
      {
        method: "DELETE",
      }
    );
  },

  uploadImage(file) {
    return apiRequest(
      "/admin/resources/uploads/image",
      {
        method: "POST",
        body:
          createFileBody(
            file
          ),
      }
    );
  },

  uploadPdf(file) {
    return apiRequest(
      "/admin/resources/uploads/pdf",
      {
        method: "POST",
        body:
          createFileBody(
            file
          ),
      }
    );
  },
};
