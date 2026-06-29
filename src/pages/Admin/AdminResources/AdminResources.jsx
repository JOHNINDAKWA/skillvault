import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArchive,
  FiBookOpen,
  FiEdit3,
  FiEye,
  FiFilter,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

import { resources } from "../../../data/resources.js";
import "./AdminResources.css";

const adminResources = resources.map((resource, index) => ({
  ...resource,
  status: [
    "Published",
    "Published",
    "Draft",
    "Published",
    "Archived",
    "Published",
  ][index % 6],
  sales: [84, 62, 17, 49, 8, 37, 26, 14][index % 8],
  lastUpdated: [
    "Today",
    "Yesterday",
    "24 Jun 2026",
    "22 Jun 2026",
    "19 Jun 2026",
    "14 Jun 2026",
    "09 Jun 2026",
    "02 Jun 2026",
  ][index % 8],
}));

function AdminResources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");

  const filteredResources = useMemo(() => {
    return adminResources.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        activeStatus === "All" || resource.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, activeStatus]);

  const publishedCount = adminResources.filter(
    (resource) => resource.status === "Published",
  ).length;

  const draftCount = adminResources.filter(
    (resource) => resource.status === "Draft",
  ).length;

  const archivedCount = adminResources.filter(
    (resource) => resource.status === "Archived",
  ).length;

  const totalSales = adminResources.reduce(
    (total, resource) => total + resource.sales,
    0,
  );

  return (
    <section className="admin-resources-page">
      <div className="admin-resources-hero">
        <div>
          <span>Resource Management</span>

          <h1>Manage digital resources</h1>

          <p>
            Review listed products, monitor sales, check publishing status, and
            prepare resources for editing, deletion, or new uploads.
          </p>
        </div>

        <Link to="/admin/resources/new">
          <FiPlus />
          Add Resource
        </Link>
      </div>

      <div className="admin-resources-stats">
        <article>
          <FiBookOpen />
          <div>
            <strong>{adminResources.length}</strong>
            <span>Total resources</span>
          </div>
        </article>

        <article>
          <FiEye />
          <div>
            <strong>{publishedCount}</strong>
            <span>Published</span>
          </div>
        </article>

        <article>
          <FiEdit3 />
          <div>
            <strong>{draftCount}</strong>
            <span>Drafts</span>
          </div>
        </article>

        <article>
          <FiArchive />
          <div>
            <strong>{totalSales}</strong>
            <span>Total sales</span>
          </div>
        </article>
      </div>

      <div className="admin-resources-panel">
        <div className="admin-resources-panel-header">
          <div>
            <span>Inventory</span>
            <h2>All resources</h2>
          </div>

          <div className="admin-resources-tools">
            <label className="admin-resources-search">
              <FiSearch />

              <input
                type="search"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="admin-resources-filter">
              <FiFilter />

              <select
                value={activeStatus}
                onChange={(event) => setActiveStatus(event.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-resources-tabs">
          <button
            type="button"
            className={activeStatus === "All" ? "is-active" : ""}
            onClick={() => setActiveStatus("All")}
          >
            All
          </button>

          <button
            type="button"
            className={activeStatus === "Published" ? "is-active" : ""}
            onClick={() => setActiveStatus("Published")}
          >
            Published
          </button>

          <button
            type="button"
            className={activeStatus === "Draft" ? "is-active" : ""}
            onClick={() => setActiveStatus("Draft")}
          >
            Draft
          </button>

          <button
            type="button"
            className={activeStatus === "Archived" ? "is-active" : ""}
            onClick={() => setActiveStatus("Archived")}
          >
            Archived
          </button>
        </div>

        <div className="admin-resources-table">
          <div className="admin-resources-table-head">
            <span>Resource</span>
            <span>Category</span>
            <span>Type</span>
            <span>Price</span>
            <span>Sales</span>
            <span>Status</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>

          {filteredResources.map((resource) => (
            <article className="admin-resource-item" key={resource.id}>
              <div className="admin-resource-product">
                <img src={resource.image} alt={resource.title} />

                <div>
                  <strong>{resource.title}</strong>
                  <small>{resource.description}</small>
                </div>
              </div>

              <span>{resource.category}</span>

              <span>{resource.type}</span>

              <strong>KSh {resource.price.toLocaleString()}</strong>

              <span>{resource.sales}</span>

              <em
                className={`admin-resource-status admin-resource-status-${resource.status.toLowerCase()}`}
              >
                {resource.status}
              </em>

              <span>{resource.lastUpdated}</span>

              <div className="admin-resource-actions">
                <Link to={`/product/${resource.slug}`} title="View resource">
                  <FiEye />
                </Link>

                <Link
                  to={`/admin/resources/${resource.slug}/edit`}
                  title="Edit resource"
                >
                  <FiEdit3 />
                </Link>

                <button type="button" title="Delete resource">
                  <FiTrash2 />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="admin-resources-empty">
            <h3>No resources found</h3>
            <p>Try changing the search term or selected status filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminResources;
