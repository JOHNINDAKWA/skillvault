import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArchive,
  FiBookOpen,
  FiCheckCircle,
  FiEdit3,
  FiEye,
  FiFileText,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
  FiShoppingBag,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { adminResourceService } from "../../../services/adminResourceService.js";

import "./AdminResources.css";

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-US")}`;
}

function AdminResources() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadResources = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await adminResourceService.listResources();
      setResources(response.data.resources);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const filteredResources = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return resources.filter((resource) => {
      const searchableText = [
        resource.title,
        resource.category,
        resource.type,
        resource.shortDescription,
        resource.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        activeStatus === "all" ||
        resource.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [resources, searchTerm, activeStatus]);

  const resourceStats = useMemo(() => {
    const published = resources.filter(
      (resource) => resource.status === "published"
    ).length;

    const drafts = resources.filter(
      (resource) => resource.status === "draft"
    ).length;

    const archived = resources.filter(
      (resource) => resource.status === "archived"
    ).length;

    const sales = resources.reduce(
      (total, resource) =>
        total + Number(resource.sales || 0),
      0
    );

    return {
      total: resources.length,
      published,
      drafts,
      archived,
      sales,
    };
  }, [resources]);

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setPageError("");
    setSuccessMessage("");

    try {
      const response = await adminResourceService.deleteResource(
        deleteTarget.id
      );

      setResources((currentResources) =>
        currentResources.filter(
          (resource) => resource.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);
      setSuccessMessage(response.message);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <main className="arv-page">
      <section className="arv-hero">
        <div>
          <span>Resource management</span>
          <h1>Manage digital resources</h1>
          <p>
            Create, publish, update, archive, and review every resource
            available through SkillVault.
          </p>
        </div>

        <Link to="/admin/resources/new" className="arv-primary-action">
          <FiPlus aria-hidden="true" />
          Add resource
        </Link>
      </section>

      {pageError && (
        <div className="arv-message arv-message-error" role="alert">
          <span>{pageError}</span>

          <button type="button" onClick={loadResources}>
            <FiRefreshCcw aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {successMessage && (
        <div className="arv-message arv-message-success" role="status">
          <FiCheckCircle aria-hidden="true" />
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss success message"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      <section
        className="arv-stats-grid"
        aria-label="Resource statistics"
      >
        <article className="arv-stat-card">
          <span className="arv-stat-icon">
            <FiBookOpen aria-hidden="true" />
          </span>

          <div>
            <span>Total resources</span>
            <strong>{resourceStats.total}</strong>
          </div>
        </article>

        <article className="arv-stat-card">
          <span className="arv-stat-icon">
            <FiEye aria-hidden="true" />
          </span>

          <div>
            <span>Published</span>
            <strong>{resourceStats.published}</strong>
          </div>
        </article>

        <article className="arv-stat-card">
          <span className="arv-stat-icon">
            <FiEdit3 aria-hidden="true" />
          </span>

          <div>
            <span>Drafts</span>
            <strong>{resourceStats.drafts}</strong>
          </div>
        </article>

        <article className="arv-stat-card">
          <span className="arv-stat-icon">
            <FiArchive aria-hidden="true" />
          </span>

          <div>
            <span>Archived</span>
            <strong>{resourceStats.archived}</strong>
          </div>
        </article>

        <article className="arv-stat-card arv-stat-card-accent">
          <span className="arv-stat-icon">
            <FiShoppingBag aria-hidden="true" />
          </span>

          <div>
            <span>Total sales</span>
            <strong>{resourceStats.sales}</strong>
          </div>
        </article>
      </section>

      <section className="arv-panel">
        <div className="arv-panel-header">
          <div className="arv-panel-title">
            <span>Inventory</span>
            <h2>All resources</h2>
            <p>
              Showing {filteredResources.length} of {resources.length} resources
            </p>
          </div>

          <div className="arv-toolbar">
            <label className="arv-search">
              <FiSearch aria-hidden="true" />

              <input
                type="search"
                placeholder="Search by title, category, type..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <FiX aria-hidden="true" />
                </button>
              )}
            </label>

            <label className="arv-status-filter">
              <span className="sr-only">Filter by status</span>

              <select
                value={activeStatus}
                onChange={(event) =>
                  setActiveStatus(event.target.value)
                }
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="archived">Archived</option>
              </select>
            </label>

            <button
              type="button"
              className="arv-refresh"
              onClick={loadResources}
              disabled={isLoading}
            >
              <FiRefreshCcw
                className={isLoading ? "is-spinning" : ""}
                aria-hidden="true"
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="arv-filter-chips" aria-label="Resource status filters">
          {[
            ["all", "All", resourceStats.total],
            ["published", "Published", resourceStats.published],
            ["draft", "Drafts", resourceStats.drafts],
            ["archived", "Archived", resourceStats.archived],
          ].map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              className={activeStatus === value ? "is-active" : ""}
              onClick={() => setActiveStatus(value)}
            >
              <span>{label}</span>
              <strong>{count}</strong>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="arv-loading" role="status">
            <span className="arv-spinner" aria-hidden="true" />
            <strong>Loading resources</strong>
            <p>Please wait while the latest inventory is retrieved.</p>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="arv-table-wrap">
            <table className="arv-table">
              <thead>
                <tr>
                  <th scope="col">Resource</th>
                  <th scope="col">Classification</th>
                  <th scope="col">Price</th>
                  <th scope="col">Sales</th>
                  <th scope="col">Status</th>
                  <th scope="col">Updated</th>
                  <th scope="col" className="arv-actions-column">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredResources.map((resource) => (
                  <tr key={resource.id}>
                    <td data-label="Resource">
                      <div className="arv-resource-cell">
                        {resource.coverImage?.url ? (
                          <img
                            src={resource.coverImage.url}
                            alt={resource.title}
                          />
                        ) : (
                          <span className="arv-cover-placeholder">
                            <FiFileText aria-hidden="true" />
                          </span>
                        )}

                        <div>
                          <strong>{resource.title}</strong>

                          <p>
                            {resource.shortDescription ||
                              resource.description ||
                              "No description added."}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td data-label="Classification">
                      <div className="arv-classification">
                        <strong>{resource.category}</strong>
                        <span>{resource.type}</span>
                      </div>
                    </td>

                    <td data-label="Price">
                      <strong className="arv-price">
                        {formatMoney(resource.price)}
                      </strong>
                    </td>

                    <td data-label="Sales">
                      <span className="arv-sales">
                        {Number(resource.sales || 0).toLocaleString(
                          "en-US"
                        )}
                      </span>
                    </td>

                    <td data-label="Status">
                      <span
                        className={`arv-status arv-status-${resource.status}`}
                      >
                        <span aria-hidden="true" />
                        {formatStatus(resource.status)}
                      </span>
                    </td>

                    <td data-label="Updated">
                      <span className="arv-date">
                        {formatDate(resource.updatedAt)}
                      </span>
                    </td>

                    <td data-label="Actions">
                      <div className="arv-actions">
                        {resource.status === "published" ? (
                          <Link
                            to={`/product/${resource.slug}`}
                            className="arv-action-button"
                            aria-label={`View ${resource.title}`}
                            title="View resource"
                          >
                            <FiEye aria-hidden="true" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="arv-action-button"
                            disabled
                            aria-label={`View unavailable for ${resource.title}`}
                            title="Publish the resource before viewing it publicly."
                          >
                            <FiEye aria-hidden="true" />
                          </button>
                        )}

                        <Link
                          to={`/admin/resources/${resource.slug}/edit`}
                          className="arv-action-button"
                          aria-label={`Edit ${resource.title}`}
                          title="Edit resource"
                        >
                          <FiEdit3 aria-hidden="true" />
                        </Link>

                        <button
                          type="button"
                          className="arv-action-button arv-action-delete"
                          onClick={() => setDeleteTarget(resource)}
                          aria-label={`Delete ${resource.title}`}
                          title="Delete resource"
                        >
                          <FiTrash2 aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="arv-empty">
            <FiSearch aria-hidden="true" />

            <h3>No resources found</h3>

            <p>
              Try changing the search term or selected status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setActiveStatus("all");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {deleteTarget && (
        <div className="arv-modal-backdrop">
          <div
            className="arv-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-resource-title"
          >
            <button
              type="button"
              className="arv-modal-close"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              aria-label="Close deletion confirmation"
            >
              <FiX aria-hidden="true" />
            </button>

            <span className="arv-modal-icon">
              <FiTrash2 aria-hidden="true" />
            </span>

            <span className="arv-modal-eyebrow">Delete resource</span>

            <h2 id="delete-resource-title">
              Delete {deleteTarget.title}?
            </h2>

            <p>
              This permanently removes the database record and its uploaded
              cover, gallery images, and PDF file. This action cannot be
              undone.
            </p>

            <div className="arv-modal-actions">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="is-danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <span
                    className="arv-spinner arv-spinner-light"
                    aria-hidden="true"
                  />
                )}

                {isDeleting ? "Deleting..." : "Delete resource"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminResources;