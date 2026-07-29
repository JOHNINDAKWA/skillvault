import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiImage,
  FiList,
  FiPlus,
  FiRefreshCcw,
  FiShoppingBag,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import { adminDashboardService } from "../../../services/adminDashboardService.js";
import { adminResourceService } from "../../../services/adminResourceService.js";

import "./AdminDashboard.css";


function extractImageUrl(imageValue) {
  if (typeof imageValue === "string") {
    return imageValue.trim();
  }

  if (!imageValue || typeof imageValue !== "object") {
    return "";
  }

  const possibleUrls = [
    imageValue.url,
    imageValue.secureUrl,
    imageValue.secure_url,
    imageValue.src,
  ];

  return (
    possibleUrls.find(
      (value) =>
        typeof value === "string" && value.trim()
    )?.trim() || ""
  );
}

function createResourceImageLookup(resources = []) {
  const lookup = new Map();

  resources.forEach((resource) => {
    const imageUrl =
      extractImageUrl(resource.coverImage) ||
      extractImageUrl(resource.image) ||
      extractImageUrl(resource.thumbnail) ||
      extractImageUrl(resource.gallery?.[0]);

    if (!imageUrl) {
      return;
    }

    if (resource.id !== undefined && resource.id !== null) {
      lookup.set(`id:${String(resource.id)}`, imageUrl);
    }

    if (resource.slug) {
      lookup.set(
        `slug:${String(resource.slug).toLowerCase()}`,
        imageUrl
      );
    }

    if (resource.title) {
      lookup.set(
        `title:${String(resource.title)
          .trim()
          .toLowerCase()}`,
        imageUrl
      );
    }
  });

  return lookup;
}

function getCurrentResourceImage(resource, imageLookup) {
  if (!resource || !imageLookup) {
    return "";
  }

  const possibleKeys = [
    resource.id !== undefined &&
    resource.id !== null
      ? `id:${String(resource.id)}`
      : "",
    resource.resourceId !== undefined &&
    resource.resourceId !== null
      ? `id:${String(resource.resourceId)}`
      : "",
    resource.slug
      ? `slug:${String(
          resource.slug
        ).toLowerCase()}`
      : "",
    resource.title
      ? `title:${String(resource.title)
          .trim()
          .toLowerCase()}`
      : "",
  ].filter(Boolean);

  for (const key of possibleKeys) {
    const imageUrl = imageLookup.get(key);

    if (imageUrl) {
      return imageUrl;
    }
  }

  return "";
}

function getImageCandidates(resource, imageLookup) {
  const candidates = [
    getCurrentResourceImage(resource, imageLookup),
    extractImageUrl(resource?.coverImage),
    extractImageUrl(resource?.image),
    extractImageUrl(resource?.thumbnail),
    extractImageUrl(resource?.gallery?.[0]),
  ].filter(Boolean);

  return [...new Set(candidates)];
}

function ResourceCoverImage({
  resource,
  imageLookup,
  alt,
  fallbackClassName,
}) {
  const candidates = getImageCandidates(
    resource,
    imageLookup
  );

  const candidateKey = candidates.join("|");
  const [candidateIndex, setCandidateIndex] =
    useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidateKey]);

  const imageSource = candidates[candidateIndex];

  if (!imageSource) {
    return (
      <span className={fallbackClassName}>
        <FiImage aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={imageSource}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() =>
        setCandidateIndex(
          (currentIndex) => currentIndex + 1
        )
      }
    />
  );
}

function formatMoney(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-US")}`;
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusIcon(status) {
  if (status === "paid") {
    return <FiCheckCircle aria-hidden="true" />;
  }

  if (status === "pending") {
    return <FiClock aria-hidden="true" />;
  }

  if (status === "refunded") {
    return <FiRefreshCcw aria-hidden="true" />;
  }

  return <FiXCircle aria-hidden="true" />;
}

function healthIcon(label) {
  if (label === "Checkout flow") {
    return <FiActivity aria-hidden="true" />;
  }

  if (label === "PDF reader") {
    return <FiBookOpen aria-hidden="true" />;
  }

  return <FiClock aria-hidden="true" />;
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [resourceImageLookup, setResourceImageLookup] =
    useState(() => new Map());

  const loadDashboard = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const [dashboardResult, resourcesResult] =
        await Promise.allSettled([
          adminDashboardService.getDashboard(),
          adminResourceService.listResources(),
        ]);

      if (dashboardResult.status === "rejected") {
        throw dashboardResult.reason;
      }

      setDashboard(
        dashboardResult.value.data.dashboard
      );

      if (resourcesResult.status === "fulfilled") {
        setResourceImageLookup(
          createResourceImageLookup(
            resourcesResult.value.data.resources || []
          )
        );
      }
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <section
        className="admin-v2-loading"
        role="status"
        aria-live="polite"
      >
        <span className="admin-v2-spinner" aria-hidden="true" />

        <h1>Loading dashboard</h1>

        <p>
          SkillVault is preparing the latest revenue, orders, resources,
          customers, and platform health.
        </p>
      </section>
    );
  }

  const stats = dashboard?.stats || {
    revenueLast30Days: 0,
    totalOrders: 0,
    publishedResources: 0,
    knownCustomers: 0,
  };

  const recentOrders = dashboard?.recentOrders || [];
  const topResources = dashboard?.topResources || [];
  const health = dashboard?.health || [];

  const statCards = [
    {
      label: "Total orders",
      value: stats.totalOrders,
      helper: "All recorded purchases",
      icon: <FiShoppingBag aria-hidden="true" />,
    },
    {
      label: "Published resources",
      value: stats.publishedResources,
      helper: "Currently available",
      icon: <FiBookOpen aria-hidden="true" />,
    },
    {
      label: "Known customers",
      value: stats.knownCustomers,
      helper: "Recognised customer profiles",
      icon: <FiUsers aria-hidden="true" />,
    },
  ];

  const quickActions = [
    {
      title: "Add a new resource",
      description: "Publish a book, guide, template, or planner.",
      to: "/admin/resources/new",
      icon: <FiPlus aria-hidden="true" />,
    },
    {
      title: "Review all orders",
      description: "Open the full order history and payment records.",
      to: "/admin/orders",
      icon: <FiList aria-hidden="true" />,
    },
    {
      title: "Manage the resource library",
      description: "Edit, organise, publish, or unpublish resources.",
      to: "/admin/resources",
      icon: <FiBookOpen aria-hidden="true" />,
    },
  ];

  return (
    <main className="admin-v2-page">
      {pageError && (
        <div className="admin-v2-message" role="alert">
          <FiAlertCircle aria-hidden="true" />

          <div>
            <strong>The dashboard could not be refreshed.</strong>
            <span>{pageError}</span>
          </div>

          <button type="button" onClick={loadDashboard}>
            <FiRefreshCcw aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      <section className="admin-v2-hero">
        <div className="admin-v2-hero-copy">
          <span>SkillVault admin</span>

          <h1>Dashboard overview</h1>

          <p>
            A clear view of sales, customers, resources, and operational
            activity.
          </p>
        </div>

        <Link
          to="/admin/resources/new"
          className="admin-v2-hero-action"
        >
          <FiPlus aria-hidden="true" />
          Add resource
        </Link>
      </section>

      <section
        className="admin-v2-overview"
        aria-label="Dashboard overview"
      >
        <article className="admin-v2-revenue-card">
          <div className="admin-v2-revenue-top">
            <span className="admin-v2-card-icon">
              <FiCreditCard aria-hidden="true" />
            </span>

            <span>Revenue in the last 30 days</span>
          </div>

          <strong>{formatMoney(stats.revenueLast30Days)}</strong>

          <p>
            Revenue recorded from completed SkillVault purchases during
            the latest 30-day period.
          </p>

          <Link to="/admin/orders">
            View revenue activity
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </article>

        <div className="admin-v2-stats-grid">
          {statCards.map((item) => (
            <article className="admin-v2-stat-card" key={item.label}>
              <span className="admin-v2-card-icon">{item.icon}</span>

              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.helper}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="admin-v2-quick-actions"
        aria-labelledby="admin-quick-actions-title"
      >
        <div className="admin-v2-section-intro">
          <span>Quick actions</span>
          <h2 id="admin-quick-actions-title">
            Common admin tasks
          </h2>
        </div>

        <div className="admin-v2-quick-grid">
          {quickActions.map((action) => (
            <Link
              to={action.to}
              className="admin-v2-quick-card"
              key={action.title}
            >
              <span>{action.icon}</span>

              <div>
                <strong>{action.title}</strong>
                <p>{action.description}</p>
              </div>

              <FiArrowUpRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-v2-content-grid">
        <div
          className="admin-v2-panel admin-v2-orders-panel"
          aria-labelledby="admin-recent-orders-title"
        >
          <div className="admin-v2-panel-heading">
            <div>
              <span>Orders</span>
              <h2 id="admin-recent-orders-title">
                Recent checkout activity
              </h2>
              <p>
                The latest purchases and payment statuses across the
                store.
              </p>
            </div>

            <Link to="/admin/orders">
              View all orders
              <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="admin-v2-orders-list">
              <div className="admin-v2-orders-labels" aria-hidden="true">
                <span>Customer and resource</span>
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
              </div>

              {recentOrders.map((order) => (
                <article className="admin-v2-order-row" key={order.id}>
                  <div className="admin-v2-order-customer">
                    <strong>{order.customer}</strong>

                    <span>
                      {order.resource}
                      {order.additionalItems > 0 &&
                        ` +${order.additionalItems} more`}
                    </span>
                  </div>

                  <span className="admin-v2-order-date">
                    {formatDate(order.date)}
                  </span>

                  <strong className="admin-v2-order-amount">
                    {formatMoney(order.amount)}
                  </strong>

                  <span
                    className={`admin-v2-order-status admin-v2-order-status-${order.status}`}
                  >
                    {statusIcon(order.status)}
                    {order.statusLabel}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-v2-empty">
              <FiShoppingBag aria-hidden="true" />

              <h3>No checkout activity yet</h3>

              <p>
                Orders and incomplete checkout journeys will appear
                here.
              </p>
            </div>
          )}
        </div>

        <aside className="admin-v2-side-column">
          <section
            className="admin-v2-panel"
            aria-labelledby="admin-top-resources-title"
          >
            <div className="admin-v2-panel-heading admin-v2-panel-heading-compact">
              <div>
                <span>Resources</span>
                <h2 id="admin-top-resources-title">Top sellers</h2>
              </div>

              <Link to="/admin/resources">
                Manage
                <FiArrowUpRight aria-hidden="true" />
              </Link>
            </div>

            {topResources.length > 0 ? (
              <div className="admin-v2-top-resources">
                {topResources.map((resource, index) => (
                  <article
                    className="admin-v2-resource-row"
                    key={resource.id || resource.slug}
                  >
                    <span className="admin-v2-resource-rank">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <ResourceCoverImage
                      resource={resource}
                      imageLookup={resourceImageLookup}
                      alt={
                        resource.title ||
                        "SkillVault resource"
                      }
                      fallbackClassName="admin-v2-resource-placeholder"
                    />

                    <div className="admin-v2-resource-copy">
                      <strong>{resource.title}</strong>
                      <span>
                        {resource.category || "Uncategorised"}
                      </span>
                    </div>

                    <div className="admin-v2-resource-sales">
                      <strong>
                        {formatMoney(resource.revenue)}
                      </strong>

                      <span>
                        {resource.sales} sale
                        {resource.sales === 1 ? "" : "s"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-v2-empty admin-v2-empty-small">
                <FiBookOpen aria-hidden="true" />

                <h3>No paid sales yet</h3>

                <p>
                  Top-selling resources will appear after completed
                  orders.
                </p>
              </div>
            )}
          </section>

          <section
            className="admin-v2-panel"
            aria-labelledby="admin-health-title"
          >
            <div className="admin-v2-panel-heading admin-v2-panel-heading-compact">
              <div>
                <span>Platform health</span>
                <h2 id="admin-health-title">System status</h2>
              </div>

              <button
                type="button"
                className="admin-v2-refresh"
                onClick={loadDashboard}
              >
                <FiRefreshCcw aria-hidden="true" />
                Refresh
              </button>
            </div>

            <div className="admin-v2-health-list">
              {health.map((item) => (
                <article
                  className={`admin-v2-health-item admin-v2-health-${item.status}`}
                  key={item.label}
                >
                  <span className="admin-v2-health-icon">
                    {healthIcon(item.label)}
                  </span>

                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                  </div>

                  <span className="admin-v2-health-dot" aria-hidden="true" />
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

export default AdminDashboard;