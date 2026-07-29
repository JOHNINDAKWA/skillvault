import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiImage,
  FiRefreshCcw,
  FiSearch,
  FiShoppingBag,
  FiSmartphone,
  FiUser,
  FiUserCheck,
  FiUserX,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import { adminOrderService } from "../../../services/adminOrderService.js";
import { adminResourceService } from "../../../services/adminResourceService.js";

import "./AdminOrders.css";

const statusOptions = [
  ["all", "All"],
  ["paid", "Paid"],
  ["pending", "Pending"],
  ["failed", "Failed"],
  ["refunded", "Refunded"],
  ["abandoned", "Abandoned"],
  ["details_captured", "Details captured"],
  ["started", "Started"],
];

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
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status) {
  return (
    statusOptions.find(([value]) => value === status)?.[1] ||
    status
  );
}

function getStatusIcon(status) {
  if (status === "paid") {
    return <FiCheckCircle aria-hidden="true" />;
  }

  if (
    ["pending", "started", "details_captured"].includes(
      status
    )
  ) {
    return <FiClock aria-hidden="true" />;
  }

  if (status === "refunded") {
    return <FiRefreshCcw aria-hidden="true" />;
  }

  return <FiXCircle aria-hidden="true" />;
}


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

function getCurrentResourceImage(item, imageLookup) {
  if (!item || !imageLookup) {
    return "";
  }

  const possibleKeys = [
    item.resourceId !== undefined &&
    item.resourceId !== null
      ? `id:${String(item.resourceId)}`
      : "",
    item.resource?.id !== undefined &&
    item.resource?.id !== null
      ? `id:${String(item.resource.id)}`
      : "",
    item.slug
      ? `slug:${String(item.slug).toLowerCase()}`
      : "",
    item.resource?.slug
      ? `slug:${String(
          item.resource.slug
        ).toLowerCase()}`
      : "",
    item.title
      ? `title:${String(item.title)
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

function getImageCandidates(item, imageLookup) {
  const candidates = [
    getCurrentResourceImage(item, imageLookup),
    extractImageUrl(item?.coverImage),
    extractImageUrl(item?.image),
    extractImageUrl(item?.thumbnail),
    extractImageUrl(item?.resource?.coverImage),
    extractImageUrl(item?.resource?.image),
    extractImageUrl(item?.gallery?.[0]),
  ].filter(Boolean);

  return [...new Set(candidates)];
}

function ResourceCoverImage({
  item,
  imageLookup,
  alt,
  fallbackClassName,
}) {
  const candidates = getImageCandidates(
    item,
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

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function saveTextFile(fileName, contents, type) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function AdminOrders() {
  const [journeys, setJourneys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [refreshingOrderId, setRefreshingOrderId] =
    useState(null);
  const [resourceImageLookup, setResourceImageLookup] =
    useState(() => new Map());

  const loadJourneys = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const [journeysResult, resourcesResult] =
        await Promise.allSettled([
          adminOrderService.listJourneys(),
          adminResourceService.listResources(),
        ]);

      if (journeysResult.status === "rejected") {
        throw journeysResult.reason;
      }

      setJourneys(
        journeysResult.value.data.journeys || []
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
    loadJourneys();
  }, []);

  const filteredOrders = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return journeys.filter((journey) => {
      const searchableItems = (journey.items || [])
        .map((item) =>
          [
            item.title,
            item.category,
            item.type,
            item.slug,
          ]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ");

      const searchableText = [
        journey.reference,
        journey.receiptNumber,
        journey.mpesaReceiptNumber,
        journey.customer?.fullName,
        journey.customer?.email,
        journey.customer?.phone,
        journey.customer?.mpesaPhone,
        searchableItems,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);

      const matchesStatus =
        activeStatus === "all" ||
        journey.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [journeys, searchTerm, activeStatus]);

  const orderStats = useMemo(() => {
    const paid = journeys.filter(
      (journey) => journey.status === "paid"
    );

    const abandoned = journeys.filter(
      (journey) => journey.status === "abandoned"
    );

    const accountsCreated = journeys.filter(
      (journey) => journey.accountCreated
    );

    const revenue = paid.reduce(
      (total, order) =>
        total + Number(order.amount || 0),
      0
    );

    const counts = statusOptions.reduce(
      (result, [value]) => {
        result[value] =
          value === "all"
            ? journeys.length
            : journeys.filter(
                (journey) => journey.status === value
              ).length;

        return result;
      },
      {}
    );

    return {
      revenue,
      total: journeys.length,
      abandoned: abandoned.length,
      accounts: accountsCreated.length,
      counts,
    };
  }, [journeys]);

  const exportOrders = () => {
    const headings = [
      "Reference",
      "Status",
      "Customer Name",
      "Email",
      "Phone",
      "M-Pesa Phone",
      "Account Created",
      "Follow-up Consent",
      "Resources",
      "Amount",
      "M-Pesa Receipt",
      "Receipt",
      "Last Step",
      "Created",
      "Last Activity",
    ];

    const rows = filteredOrders.map((journey) =>
      [
        journey.reference,
        statusLabel(journey.status),
        journey.customer?.fullName,
        journey.customer?.email,
        journey.customer?.phone,
        journey.customer?.mpesaPhone,
        journey.accountCreated ? "Yes" : "No",
        journey.followUpConsent ? "Yes" : "No",
        (journey.items || [])
          .map((item) => item.title)
          .join(" | "),
        journey.amount,
        journey.mpesaReceiptNumber,
        journey.receiptNumber,
        journey.lastStep,
        journey.date,
        journey.lastActivityAt,
      ]
        .map(escapeCsv)
        .join(",")
    );

    saveTextFile(
      `skillvault-orders-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      [
        headings.map(escapeCsv).join(","),
        ...rows,
      ].join("\n"),
      "text/csv;charset=utf-8"
    );
  };

  const downloadReceipt = (journey) => {
    if (journey.status !== "paid") {
      return;
    }

    const contents = [
      "SKILLVAULT PAYMENT RECEIPT",
      "",
      `Order: ${journey.reference}`,
      `Receipt: ${
        journey.receiptNumber || "Not assigned"
      }`,
      `M-Pesa Reference: ${
        journey.mpesaReceiptNumber || "Not available"
      }`,
      `Customer: ${
        journey.customer?.fullName || "Not provided"
      }`,
      `Email: ${
        journey.customer?.email || "Not provided"
      }`,
      `Phone: ${
        journey.customer?.phone || "Not provided"
      }`,
      `Amount: ${formatMoney(journey.amount)}`,
      `Date: ${formatDate(
        journey.paidAt || journey.date
      )}`,
      "",
      "Resources:",
      ...(journey.items || []).map(
        (item) =>
          `- ${item.title} (${formatMoney(item.price)})`
      ),
    ].join("\n");

    saveTextFile(
      `${journey.reference}-receipt.txt`,
      contents,
      "text/plain;charset=utf-8"
    );
  };

  const refreshOrder = async (journey) => {
    if (!journey.orderId) {
      await loadJourneys();
      return;
    }

    setRefreshingOrderId(journey.orderId);
    setPageError("");
    setPageMessage("");

    try {
      const response =
        await adminOrderService.refreshOrder(
          journey.orderId
        );

      setPageMessage(response.message);
      await loadJourneys();
    } catch (error) {
      setPageError(error.message);
    } finally {
      setRefreshingOrderId(null);
    }
  };

  return (
    <main className="aov-page">
      <section className="aov-hero">
        <div>
          <span>Checkout intelligence</span>

          <h1>Orders and checkout journeys</h1>

          <p>
            Monitor completed purchases, incomplete checkouts,
            customer details, product interest, and payment activity.
          </p>
        </div>

        <button
          type="button"
          className="aov-export-button"
          onClick={exportOrders}
          disabled={filteredOrders.length === 0}
        >
          <FiDownload aria-hidden="true" />
          Export current view
        </button>
      </section>

      {pageError && (
        <div className="aov-message aov-message-error" role="alert">
          <FiAlertCircle aria-hidden="true" />
          <span>{pageError}</span>

          <button type="button" onClick={loadJourneys}>
            <FiRefreshCcw aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {pageMessage && (
        <div
          className="aov-message aov-message-success"
          role="status"
        >
          <FiCheckCircle aria-hidden="true" />
          <span>{pageMessage}</span>

          <button
            type="button"
            onClick={() => setPageMessage("")}
            aria-label="Dismiss message"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      <section
        className="aov-stats-grid"
        aria-label="Order statistics"
      >
        <article className="aov-stat-card aov-stat-card-featured">
          <span className="aov-stat-icon">
            <FiSmartphone aria-hidden="true" />
          </span>

          <div>
            <span>Paid revenue</span>
            <strong>{formatMoney(orderStats.revenue)}</strong>
            <p>Revenue from confirmed M-Pesa orders.</p>
          </div>
        </article>

        <article className="aov-stat-card">
          <span className="aov-stat-icon">
            <FiShoppingBag aria-hidden="true" />
          </span>

          <div>
            <span>Checkout journeys</span>
            <strong>{orderStats.total}</strong>
            <p>All recorded checkout attempts.</p>
          </div>
        </article>

        <article className="aov-stat-card">
          <span className="aov-stat-icon">
            <FiClock aria-hidden="true" />
          </span>

          <div>
            <span>Abandoned</span>
            <strong>{orderStats.abandoned}</strong>
            <p>Journeys that did not reach payment.</p>
          </div>
        </article>

        <article className="aov-stat-card">
          <span className="aov-stat-icon">
            <FiUserCheck aria-hidden="true" />
          </span>

          <div>
            <span>Linked accounts</span>
            <strong>{orderStats.accounts}</strong>
            <p>Customers linked to SkillVault accounts.</p>
          </div>
        </article>
      </section>

      <section className="aov-panel">
        <div className="aov-panel-header">
          <div>
            <span>Customer journey data</span>
            <h2>Recent checkout activity</h2>
            <p>
              Showing {filteredOrders.length} of{" "}
              {journeys.length} journeys
            </p>
          </div>

          <div className="aov-toolbar">
            <label className="aov-search">
              <FiSearch aria-hidden="true" />

              <input
                type="search"
                placeholder="Search customer, order, receipt, resource..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <FiX aria-hidden="true" />
                </button>
              )}
            </label>

            <label className="aov-status-select">
              <span className="sr-only">
                Filter orders by status
              </span>

              <select
                value={activeStatus}
                onChange={(event) =>
                  setActiveStatus(event.target.value)
                }
              >
                {statusOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="aov-refresh-button"
              onClick={loadJourneys}
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

        <div
          className="aov-status-tabs"
          aria-label="Order status filters"
        >
          {statusOptions.map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={
                activeStatus === value ? "is-active" : ""
              }
              onClick={() => setActiveStatus(value)}
            >
              <span>{label}</span>
              <strong>
                {orderStats.counts[value] || 0}
              </strong>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="aov-loading" role="status">
            <span className="aov-spinner" aria-hidden="true" />
            <strong>Loading checkout journeys</strong>
            <p>
              SkillVault is retrieving the latest order and payment
              activity.
            </p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="aov-table-wrap">
            <table className="aov-table">
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col">Resource</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">Account</th>
                  <th scope="col">Last activity</th>
                  <th scope="col" className="aov-actions-heading">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((journey) => {
                  const firstItem = journey.items?.[0];

                  return (
                    <tr key={journey.id}>
                      <td data-label="Customer">
                        <div className="aov-customer-cell">
                          <span className="aov-avatar">
                            <FiUser aria-hidden="true" />
                          </span>

                          <div>
                            <strong>
                              {journey.customer?.fullName ||
                                "Anonymous visitor"}
                            </strong>

                            <span>
                              {journey.customer?.email ||
                                "Email not entered"}
                            </span>

                            <span>
                              {journey.customer?.phone ||
                                "Phone not entered"}
                            </span>

                            {journey.followUpConsent && (
                              <em>Follow-up allowed</em>
                            )}
                          </div>
                        </div>
                      </td>

                      <td data-label="Resource">
                        <div className="aov-resource-cell">
                          <ResourceCoverImage
                            item={firstItem}
                            imageLookup={resourceImageLookup}
                            alt={
                              firstItem?.title ||
                              "SkillVault resource"
                            }
                            fallbackClassName="aov-resource-placeholder"
                          />

                          <div>
                            <strong>
                              {firstItem?.title ||
                                "Basket recorded"}
                            </strong>

                            <span>
                              {journey.itemCount} item
                              {journey.itemCount === 1
                                ? ""
                                : "s"}
                              {journey.itemCount > 1 &&
                                ` · +${
                                  journey.itemCount - 1
                                } more`}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td data-label="Amount">
                        <strong className="aov-amount">
                          {formatMoney(journey.amount)}
                        </strong>
                      </td>

                      <td data-label="Status">
                        <span
                          className={`aov-status aov-status-${journey.status}`}
                        >
                          {getStatusIcon(journey.status)}
                          {statusLabel(journey.status)}
                        </span>
                      </td>

                      <td data-label="Account">
                        <span
                          className={`aov-account ${
                            journey.accountCreated
                              ? "is-linked"
                              : ""
                          }`}
                        >
                          {journey.accountCreated ? (
                            <FiUserCheck aria-hidden="true" />
                          ) : (
                            <FiUserX aria-hidden="true" />
                          )}

                          {journey.accountCreated
                            ? "Linked"
                            : "Guest"}
                        </span>
                      </td>

                      <td data-label="Last activity">
                        <span className="aov-date">
                          {formatDate(
                            journey.lastActivityAt
                          )}
                        </span>
                      </td>

                      <td data-label="Actions">
                        <div className="aov-actions">
                          {firstItem?.slug ? (
                            <Link
                              to={`/product/${firstItem.slug}`}
                              className="aov-action-button aov-action-view"
                              title="View resource"
                              aria-label={`View ${
                                firstItem.title ||
                                "resource"
                              }`}
                            >
                              <FiEye aria-hidden="true" />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              className="aov-action-button aov-action-view"
                              disabled
                              title="No resource link available"
                              aria-label="Resource link unavailable"
                            >
                              <FiEye aria-hidden="true" />
                            </button>
                          )}

                          <button
                            type="button"
                            className="aov-action-button aov-action-receipt"
                            title="Download receipt"
                            aria-label={`Download receipt for ${journey.reference}`}
                            disabled={
                              journey.status !== "paid"
                            }
                            onClick={() =>
                              downloadReceipt(journey)
                            }
                          >
                            <FiDownload aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            className="aov-action-button aov-action-refresh"
                            title="Refresh stored status"
                            aria-label={`Refresh ${journey.reference}`}
                            onClick={() =>
                              refreshOrder(journey)
                            }
                            disabled={
                              refreshingOrderId ===
                              journey.orderId
                            }
                          >
                            {refreshingOrderId ===
                            journey.orderId ? (
                              <span
                                className="aov-spinner aov-spinner-small"
                                aria-hidden="true"
                              />
                            ) : (
                              <FiRefreshCcw aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="aov-empty">
            <FiSearch aria-hidden="true" />
            <h3>No checkout journeys found</h3>
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
    </main>
  );
}

export default AdminOrders;