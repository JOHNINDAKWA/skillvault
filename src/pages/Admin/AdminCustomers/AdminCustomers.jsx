import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiFilter,
  FiMail,
  FiRefreshCcw,
  FiSearch,
  FiShoppingBag,
  FiTrendingUp,
  FiUserCheck,
  FiUserX,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { adminCustomerService } from "../../../services/adminCustomerService.js";

import "./AdminCustomers.css";

const statusOptions = [
  ["all", "All"],
  ["active", "Active"],
  ["pending", "Pending"],
  ["suspended", "Suspended"],
  ["guest", "Guest"],
];

function formatMoney(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-US")}`;
}

function formatDate(value, includeTime = false) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-KE",
    includeTime
      ? {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      : {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
  ).format(new Date(value));
}

function statusLabel(status) {
  return (
    statusOptions.find(([value]) => value === status)?.[1] ||
    status
  );
}

function getInitials(name) {
  if (!name?.trim()) {
    return "SV";
  }

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function saveCsv(customers) {
  const headings = [
    "Customer",
    "Email",
    "Phone",
    "Account Created",
    "Profile Status",
    "Paid Purchases",
    "Total Paid",
    "Total Orders",
    "Checkout Sessions",
    "Incomplete Checkouts",
    "Follow-up Allowed",
    "Joined",
    "First Seen",
    "Last Activity",
    "Last Purchase",
    "Last Order",
    "Recent Resources",
  ];

  const rows = customers.map((customer) =>
    [
      customer.name,
      customer.email,
      customer.phone,
      customer.accountCreated ? "Yes" : "No",
      statusLabel(customer.status),
      customer.purchaseCount,
      customer.totalSpent,
      customer.orderCount,
      customer.checkoutCount,
      customer.incompleteCheckouts,
      customer.followUpAllowed ? "Yes" : "No",
      customer.joinedAt,
      customer.firstSeenAt,
      customer.lastActivityAt,
      customer.lastPurchaseAt,
      customer.lastOrderNumber,
      (customer.recentResources || [])
        .map((resource) => resource.title)
        .join(" | "),
    ]
      .map(escapeCsv)
      .join(",")
  );

  const document = [
    headings.map(escapeCsv).join(","),
    ...rows,
  ].join("\n");

  const blob = new Blob([document], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");

  anchor.href = url;
  anchor.download = `skillvault-customers-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    registeredAccounts: 0,
    activeAccounts: 0,
    payingCustomers: 0,
    totalPurchases: 0,
    totalValue: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const loadCustomers = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const response =
        await adminCustomerService.listCustomers();

      setCustomers(response.data.customers || []);

      setSummary(
        response.data.summary || {
          totalCustomers: 0,
          registeredAccounts: 0,
          activeAccounts: 0,
          payingCustomers: 0,
          totalPurchases: 0,
          totalValue: 0,
        }
      );
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (!selectedCustomer) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedCustomer(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [selectedCustomer]);

  const filteredCustomers = useMemo(() => {
    const searchValue = searchTerm
      .trim()
      .toLowerCase();

    return customers.filter((customer) => {
      const searchableResources = (
        customer.recentResources || []
      )
        .map((resource) =>
          [
            resource.title,
            resource.category,
            resource.type,
          ]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ");

      const searchableText = [
        customer.name,
        customer.email,
        customer.phone,
        customer.lastOrderNumber,
        searchableResources,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        searchableText.includes(searchValue);

      const matchesStatus =
        activeStatus === "all" ||
        customer.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, activeStatus]);

  const statusCounts = useMemo(() => {
    return statusOptions.reduce(
      (result, [value]) => {
        result[value] =
          value === "all"
            ? customers.length
            : customers.filter(
                (customer) =>
                  customer.status === value
              ).length;

        return result;
      },
      {}
    );
  }, [customers]);

  const summaryCards = [
    {
      label: "Known customers",
      value: summary.totalCustomers,
      icon: FiUsers,
      className: "is-indigo",
    },
    {
      label: "Registered accounts",
      value: summary.registeredAccounts,
      icon: FiUserCheck,
      className: "is-blue",
    },
    {
      label: "Paying customers",
      value: summary.payingCustomers,
      icon: FiShoppingBag,
      className: "is-green",
    },
    {
      label: "Paid purchases",
      value: summary.totalPurchases,
      icon: FiCheckCircle,
      className: "is-orange",
    },
  ];

  return (
    <main className="customers-v2-page">
      <section className="customers-v2-hero">
        <div>
          <span>Customer management</span>
          <h1>Customers</h1>

          <p>
            Review customer accounts, guest checkouts,
            purchases, engagement, and recent activity from
            one clear workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => saveCsv(filteredCustomers)}
          disabled={filteredCustomers.length === 0}
        >
          <FiDownload aria-hidden="true" />
          Export current view
        </button>
      </section>

      {pageError && (
        <div
          className="customers-v2-message"
          role="alert"
        >
          <FiRefreshCcw aria-hidden="true" />

          <span>{pageError}</span>

          <button type="button" onClick={loadCustomers}>
            Try again
          </button>
        </div>
      )}

      <section className="customers-v2-overview">
        <article className="customers-v2-value-card">
          <div>
            <span>Total customer value</span>
            <strong>
              {formatMoney(summary.totalValue)}
            </strong>

            <p>
              Confirmed value generated across paid customer
              purchases.
            </p>
          </div>

          <span>
            <FiTrendingUp aria-hidden="true" />
          </span>
        </article>

        <div className="customers-v2-summary-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                className={`customers-v2-summary-card ${card.className}`}
                key={card.label}
              >
                <span>
                  <Icon aria-hidden="true" />
                </span>

                <div>
                  <strong>{card.value}</strong>
                  <small>{card.label}</small>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="customers-v2-panel">
        <div className="customers-v2-panel-header">
          <div>
            <span>Customer records</span>
            <h2>Accounts and known guests</h2>

            <p>
              Showing {filteredCustomers.length} of{" "}
              {customers.length} customers
            </p>
          </div>

          <div className="customers-v2-tools">
            <label className="customers-v2-search">
              <FiSearch aria-hidden="true" />

              <input
                type="search"
                placeholder="Search name, email, phone, order..."
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

            <label className="customers-v2-filter">
              <FiFilter aria-hidden="true" />

              <select
                value={activeStatus}
                onChange={(event) =>
                  setActiveStatus(event.target.value)
                }
              >
                {statusOptions.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="customers-v2-refresh"
              onClick={loadCustomers}
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
          className="customers-v2-tabs"
          aria-label="Customer status filters"
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
              <strong>{statusCounts[value] || 0}</strong>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div
            className="customers-v2-loading"
            role="status"
          >
            <span
              className="customers-v2-spinner"
              aria-hidden="true"
            />

            <strong>Loading customer records</strong>

            <p>
              Retrieving accounts, purchases, and recent
              activity.
            </p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="customers-v2-table-wrap">
            <table className="customers-v2-table">
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col">Account</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Purchases</th>
                  <th scope="col">Lifetime value</th>
                  <th scope="col">Status</th>
                  <th scope="col">Last activity</th>
                  <th
                    scope="col"
                    className="customers-v2-actions-heading"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td data-label="Customer">
                      <div className="customers-v2-customer-cell">
                        <span>
                          {getInitials(customer.name)}
                        </span>

                        <div>
                          <strong>{customer.name}</strong>
                          <small>
                            {customer.email ||
                              "Email not provided"}
                          </small>

                          {customer.followUpAllowed && (
                            <em>
                              Follow-up allowed
                            </em>
                          )}
                        </div>
                      </div>
                    </td>

                    <td data-label="Account">
                      <span
                        className={`customers-v2-account ${
                          customer.accountCreated
                            ? "is-registered"
                            : "is-guest"
                        }`}
                      >
                        {customer.accountCreated ? (
                          <FiUserCheck aria-hidden="true" />
                        ) : (
                          <FiUserX aria-hidden="true" />
                        )}

                        {customer.accountCreated
                          ? "Registered"
                          : "Guest"}
                      </span>
                    </td>

                    <td data-label="Contact">
                      <div className="customers-v2-contact">
                        <strong>
                          {customer.phone ||
                            "No phone number"}
                        </strong>

                        <span>
                          {customer.email ||
                            "No email address"}
                        </span>
                      </div>
                    </td>

                    <td data-label="Purchases">
                      <div className="customers-v2-purchases">
                        <strong>
                          {customer.purchaseCount}
                        </strong>

                        <span>
                          {customer.purchaseCount === 1
                            ? "purchase"
                            : "purchases"}
                        </span>
                      </div>
                    </td>

                    <td data-label="Lifetime value">
                      <strong className="customers-v2-value">
                        {formatMoney(
                          customer.totalSpent
                        )}
                      </strong>
                    </td>

                    <td data-label="Status">
                      <span
                        className={`customers-v2-status is-${customer.status}`}
                      >
                        <span aria-hidden="true" />
                        {statusLabel(customer.status)}
                      </span>
                    </td>

                    <td data-label="Last activity">
                      <div className="customers-v2-activity">
                        <FiClock aria-hidden="true" />

                        <span>
                          {formatDate(
                            customer.lastActivityAt,
                            true
                          )}
                        </span>
                      </div>
                    </td>

                    <td data-label="Actions">
                      <div className="customers-v2-actions">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCustomer(customer)
                          }
                        >
                          <FiEye aria-hidden="true" />
                          <span>View</span>
                        </button>

                        {customer.email ? (
                          <a
                            href={`mailto:${customer.email}`}
                            className={
                              !customer.accountCreated &&
                              !customer.followUpAllowed
                                ? "needs-consent"
                                : ""
                            }
                            title={
                              !customer.accountCreated &&
                              !customer.followUpAllowed
                                ? "Email exists, but checkout follow-up permission was not recorded."
                                : "Email customer"
                            }
                          >
                            <FiMail aria-hidden="true" />
                            <span>Email</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            aria-label="No email address available"
                          >
                            <FiMail aria-hidden="true" />
                            <span>Email</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="customers-v2-empty">
            <FiUsers aria-hidden="true" />

            <h3>No customers found</h3>

            <p>
              Try changing the search term or selected
              status filter.
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

      {selectedCustomer && (
        <div
          className="customers-v2-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCustomer(null);
            }
          }}
        >
          <div
            className="customers-v2-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-detail-title"
          >
            <button
              type="button"
              className="customers-v2-modal-close"
              onClick={() => setSelectedCustomer(null)}
              aria-label="Close customer details"
            >
              <FiX aria-hidden="true" />
            </button>

            <div className="customers-v2-modal-profile">
              <span>
                {getInitials(selectedCustomer.name)}
              </span>

              <div>
                <small>Customer profile</small>

                <h2 id="customer-detail-title">
                  {selectedCustomer.name}
                </h2>

                <p>
                  {selectedCustomer.email ||
                    "Email not provided"}

                  {selectedCustomer.phone
                    ? ` · ${selectedCustomer.phone}`
                    : ""}
                </p>

                <div>
                  <span
                    className={`customers-v2-account ${
                      selectedCustomer.accountCreated
                        ? "is-registered"
                        : "is-guest"
                    }`}
                  >
                    {selectedCustomer.accountCreated
                      ? "Registered"
                      : "Guest"}
                  </span>

                  <span
                    className={`customers-v2-status is-${selectedCustomer.status}`}
                  >
                    <span aria-hidden="true" />
                    {statusLabel(
                      selectedCustomer.status
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="customers-v2-modal-stats">
              <article>
                <strong>
                  {selectedCustomer.purchaseCount}
                </strong>
                <span>Paid purchases</span>
              </article>

              <article>
                <strong>
                  {formatMoney(
                    selectedCustomer.totalSpent
                  )}
                </strong>
                <span>Total paid</span>
              </article>

              <article>
                <strong>
                  {selectedCustomer.checkoutCount}
                </strong>
                <span>Checkout sessions</span>
              </article>

              <article>
                <strong>
                  {selectedCustomer.incompleteCheckouts}
                </strong>
                <span>Incomplete checkouts</span>
              </article>
            </div>

            <div className="customers-v2-modal-body">
              <section>
                <div className="customers-v2-modal-section-heading">
                  <span>Account details</span>
                  <h3>Customer activity</h3>
                </div>

                <div className="customers-v2-detail-grid">
                  <div>
                    <span>Account</span>
                    <strong>
                      {selectedCustomer.accountCreated
                        ? "Registered account"
                        : "Guest customer"}
                    </strong>
                  </div>

                  <div>
                    <span>Joined</span>
                    <strong>
                      {selectedCustomer.accountCreated
                        ? formatDate(
                            selectedCustomer.joinedAt
                          )
                        : "No account"}
                    </strong>
                  </div>

                  <div>
                    <span>First seen</span>
                    <strong>
                      {formatDate(
                        selectedCustomer.firstSeenAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Last activity</span>
                    <strong>
                      {formatDate(
                        selectedCustomer.lastActivityAt,
                        true
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Follow-up permission</span>
                    <strong>
                      {selectedCustomer.followUpAllowed
                        ? "Recorded"
                        : "Not recorded"}
                    </strong>
                  </div>

                  <div>
                    <span>Last order</span>
                    <strong>
                      {selectedCustomer.lastOrderNumber ||
                        "No paid order"}
                    </strong>
                  </div>

                  <div>
                    <span>Last purchase</span>
                    <strong>
                      {formatDate(
                        selectedCustomer.lastPurchaseAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Total orders</span>
                    <strong>
                      {selectedCustomer.orderCount}
                    </strong>
                  </div>
                </div>
              </section>

              <section>
                <div className="customers-v2-modal-section-heading">
                  <span>Recent purchases</span>
                  <h3>Resources bought</h3>
                </div>

                {selectedCustomer.recentResources?.length >
                0 ? (
                  <div className="customers-v2-resource-list">
                    {selectedCustomer.recentResources.map(
                      (resource) => (
                        <article
                          key={
                            resource.id ||
                            resource.slug ||
                            resource.title
                          }
                        >
                          <span>
                            <FiShoppingBag aria-hidden="true" />
                          </span>

                          <div>
                            <strong>
                              {resource.title}
                            </strong>

                            <small>
                              {resource.category ||
                                "Resource"}

                              {resource.type
                                ? ` / ${resource.type}`
                                : ""}
                            </small>
                          </div>

                          <time>
                            {formatDate(resource.date)}
                          </time>
                        </article>
                      )
                    )}
                  </div>
                ) : (
                  <div className="customers-v2-no-purchases">
                    <FiShoppingBag aria-hidden="true" />

                    <p>
                      No paid resource purchases are recorded
                      for this customer.
                    </p>
                  </div>
                )}
              </section>
            </div>

            <div className="customers-v2-modal-actions">
              {selectedCustomer.email && (
                <a
                  href={`mailto:${selectedCustomer.email}`}
                >
                  <FiMail aria-hidden="true" />
                  Email customer
                </a>
              )}

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminCustomers;
