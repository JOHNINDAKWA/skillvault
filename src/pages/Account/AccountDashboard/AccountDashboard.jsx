import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FiArrowRight,
  FiArrowUpRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiHeart,
  FiImage,
  FiRefreshCcw,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";

import {
  FaReceipt,
} from "react-icons/fa6";

import {
  useAuth,
} from "../../../hooks/useAuth.js";

import {
  useWishlist,
} from "../../../hooks/useWishlist.js";

import {
  accountDashboardService,
} from "../../../services/accountDashboardService.js";

import "./AccountDashboard.css";

function formatMoney(amount) {
  return `KSh ${Number(
    amount || 0
  ).toLocaleString("en-US")}`;
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-KE",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}

function extractImageUrl(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  const possibleUrls = [
    value.url,
    value.secureUrl,
    value.secure_url,
    value.src,
  ];

  return (
    possibleUrls.find(
      (url) =>
        typeof url === "string" &&
        url.trim()
    )?.trim() || ""
  );
}

function getResourceImageCandidates(resource) {
  return [
    extractImageUrl(resource?.coverImage),
    extractImageUrl(resource?.image),
    extractImageUrl(resource?.thumbnail),
    extractImageUrl(resource?.gallery?.[0]),
  ].filter(Boolean);
}

function ResourceImage({
  resource,
  className = "",
}) {
  const candidates =
    getResourceImageCandidates(resource);

  const candidateKey =
    candidates.join("|");

  const [
    candidateIndex,
    setCandidateIndex,
  ] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidateKey]);

  const imageSource =
    candidates[candidateIndex];

  if (!imageSource) {
    return (
      <div
        className={`account-v2-image-placeholder ${className}`}
        aria-label={`${resource?.title || "Resource"} has no cover image`}
      >
        <FiImage aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={imageSource}
      alt={resource?.title || "SkillVault resource"}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() =>
        setCandidateIndex(
          (currentIndex) =>
            currentIndex + 1
        )
      }
    />
  );
}

function AccountDashboard() {
  const {
    user,
  } = useAuth();

  const {
    wishlistItems,
    wishlistCount,
    isWishlistLoading,
  } = useWishlist();

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    pageError,
    setPageError,
  ] = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const response =
        await accountDashboardService.getDashboard();

      setDashboard(
        response.data.dashboard
      );
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const purchasedResources =
    dashboard?.purchasedResources || [];

  const continueReading =
    dashboard?.continueReading || [];

  const recentPurchases =
    dashboard?.recentPurchases || [];

  const stats =
    dashboard?.stats || {
      purchasedResources: 0,
      inProgress: 0,
      availableDownloads: 0,
      receipts: 0,
    };

  const recentWishlist =
    useMemo(
      () =>
        wishlistItems.slice(0, 3),
      [wishlistItems]
    );

  const displayName =
    dashboard?.customer?.fullName ||
    user?.fullName ||
    "there";

  const firstName =
    displayName
      .trim()
      .split(/\s+/)[0];

  const featuredReading =
    continueReading[0] || null;

  const remainingReading =
    continueReading.slice(1, 4);

  const statCards = [
    {
      label: "Purchased resources",
      value: stats.purchasedResources,
      icon: FiBookOpen,
    },
    {
      label: "In progress",
      value: stats.inProgress,
      icon: FiClock,
    },
    {
      label: "Downloads",
      value: stats.availableDownloads,
      icon: FiDownload,
    },
    {
      label: "Receipts",
      value: stats.receipts,
      icon: FaReceipt,
    },
  ];

  const quickActions = [
    {
      title: "Open my library",
      description:
        "View every guide, planner, and template you have purchased.",
      to: "/account/library",
      icon: FiBookOpen,
    },
    {
      title: "View downloads",
      description:
        "Access resources that are available for offline use.",
      to: "/account/library?filter=downloads",
      icon: FiDownload,
    },
    {
      title: "View receipts",
      description:
        "Review completed orders and payment confirmations.",
      to: "/account/receipts",
      icon: FaReceipt,
    },
  ];

  if (isLoading) {
    return (
      <section
        className="account-v2-loading"
        role="status"
        aria-live="polite"
      >
        <span
          className="account-v2-spinner"
          aria-hidden="true"
        />

        <h1>
          Loading your SkillVault library
        </h1>

        <p>
          We are retrieving your purchases, reading progress,
          downloads, receipts, and saved resources.
        </p>
      </section>
    );
  }

  return (
    <main className="account-v2-page">
      {pageError && (
        <div
          className="account-v2-message"
          role="alert"
        >
          <FiRefreshCcw aria-hidden="true" />

          <div>
            <strong>
              Your dashboard could not be refreshed.
            </strong>

            <span>{pageError}</span>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
          >
            <FiRefreshCcw aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      <section className="account-v2-hero">
        <div className="account-v2-hero-copy">
          <span>
            Welcome back, {firstName}
          </span>

          <h1>
            Your SkillVault library
          </h1>

          <p>
            Continue reading, download purchased files,
            review receipts, and return to resources you
            saved for later.
          </p>
        </div>

        <div className="account-v2-hero-actions">
          <Link
            to="/account/library"
            className="account-v2-hero-secondary"
          >
            <FiBookOpen aria-hidden="true" />
            Open library
          </Link>

          <Link
            to="/resources"
            className="account-v2-hero-primary"
          >
            Browse resources
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        className="account-v2-stats"
        aria-label="Library overview"
      >
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className="account-v2-stat-card"
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

        <Link
          to="/account/wishlist"
          className="account-v2-stat-card account-v2-stat-link"
        >
          <span>
            <FiHeart aria-hidden="true" />
          </span>

          <div>
            <strong>
              {isWishlistLoading
                ? "..."
                : wishlistCount}
            </strong>

            <small>Wishlist items</small>
          </div>

          <FiArrowUpRight aria-hidden="true" />
        </Link>
      </section>

      <section className="account-v2-main-grid">
        <article className="account-v2-panel account-v2-reading-panel">
          <div className="account-v2-panel-heading">
            <div>
              <span>Continue reading</span>
              <h2>
                Pick up where you stopped
              </h2>

              <p>
                Your latest reading progress is saved
                automatically.
              </p>
            </div>

            <Link to="/account/library">
              View full library
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          {featuredReading ? (
            <div className="account-v2-reading-layout">
              <article className="account-v2-featured-reading">
                <Link
                  to={`/account/reader/${featuredReading.slug}`}
                  className="account-v2-featured-cover"
                >
                  <ResourceImage
                    resource={featuredReading}
                  />
                </Link>

                <div className="account-v2-featured-copy">
                  <span>
                    {featuredReading.category} /{" "}
                    {featuredReading.type}
                  </span>

                  <h3>
                    <Link
                      to={`/account/reader/${featuredReading.slug}`}
                    >
                      {featuredReading.title}
                    </Link>
                  </h3>

                  <p>
                    Continue from your most recent reading
                    position.
                  </p>

                  <div className="account-v2-progress-head">
                    <span>Reading progress</span>
                    <strong>
                      {featuredReading.progress}%
                    </strong>
                  </div>

                  <div
                    className="account-v2-progress-track"
                    aria-label={`${featuredReading.progress}% complete`}
                  >
                    <span
                      style={{
                        width:
                          `${featuredReading.progress}%`,
                      }}
                    />
                  </div>

                  <Link
                    to={`/account/reader/${featuredReading.slug}`}
                    className="account-v2-read-button"
                  >
                    Continue reading
                    <FiArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </article>

              {remainingReading.length > 0 && (
                <div className="account-v2-reading-list">
                  {remainingReading.map((item) => (
                    <article
                      className="account-v2-reading-row"
                      key={item.id || item.slug}
                    >
                      <Link
                        to={`/account/reader/${item.slug}`}
                        className="account-v2-reading-row-cover"
                      >
                        <ResourceImage
                          resource={item}
                        />
                      </Link>

                      <div>
                        <span>
                          {item.category} / {item.type}
                        </span>

                        <h3>
                          <Link
                            to={`/account/reader/${item.slug}`}
                          >
                            {item.title}
                          </Link>
                        </h3>

                        <div className="account-v2-reading-row-bottom">
                          <span>
                            {item.progress}% complete
                          </span>

                          <Link
                            to={`/account/reader/${item.slug}`}
                          >
                            Read
                            <FiArrowRight aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="account-v2-empty">
              <span>
                <FiBookOpen aria-hidden="true" />
              </span>

              <h3>
                Nothing in progress yet
              </h3>

              <p>
                {purchasedResources.length > 0
                  ? "Open a purchased resource to begin reading. Your progress will appear here automatically."
                  : "Your purchased resources will appear here after your first completed order."}
              </p>

              <Link
                to={
                  purchasedResources.length > 0
                    ? "/account/library"
                    : "/resources"
                }
              >
                {purchasedResources.length > 0
                  ? "Open my library"
                  : "Browse resources"}
              </Link>
            </div>
          )}
        </article>

        <aside className="account-v2-panel account-v2-actions-panel">
          <div className="account-v2-panel-heading account-v2-panel-heading-stacked">
            <div>
              <span>Quick access</span>
              <h2>
                Your account shortcuts
              </h2>

              <p>
                Move directly to the areas you use most.
              </p>
            </div>
          </div>

          <div className="account-v2-action-list">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  to={action.to}
                  key={action.title}
                >
                  <span>
                    <Icon aria-hidden="true" />
                  </span>

                  <div>
                    <strong>{action.title}</strong>
                    <p>{action.description}</p>
                  </div>

                  <FiArrowUpRight aria-hidden="true" />
                </Link>
              );
            })}
          </div>

          <Link
            to="/resources"
            className="account-v2-discover-card"
          >
            <span>
              <FiTrendingUp aria-hidden="true" />
            </span>

            <div>
              <small>Discover more</small>
              <strong>
                Find your next practical resource
              </strong>
            </div>

            <FiArrowRight aria-hidden="true" />
          </Link>
        </aside>
      </section>

      {!isWishlistLoading &&
        recentWishlist.length > 0 && (
          <section className="account-v2-panel">
            <div className="account-v2-panel-heading">
              <div>
                <span>Saved for later</span>
                <h2>
                  Resources in your wishlist
                </h2>

                <p>
                  Return to the resources you are considering.
                </p>
              </div>

              <Link to="/account/wishlist">
                View wishlist
                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>

            <div className="account-v2-wishlist-grid">
              {recentWishlist.map((item) => (
                <article
                  className="account-v2-wishlist-card"
                  key={item.id || item.slug}
                >
                  <Link
                    to={`/product/${item.slug}`}
                    className="account-v2-wishlist-cover"
                  >
                    <ResourceImage resource={item} />
                  </Link>

                  <div className="account-v2-wishlist-copy">
                    <span>
                      {item.category} / {item.type}
                    </span>

                    <h3>
                      <Link
                        to={`/product/${item.slug}`}
                      >
                        {item.title}
                      </Link>
                    </h3>

                    <div>
                      <strong>
                        {formatMoney(item.price)}
                      </strong>

                      <Link
                        to={`/product/${item.slug}`}
                      >
                        View resource
                        <FiArrowRight aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

      {isWishlistLoading && (
        <section className="account-v2-panel">
          <div
            className="account-v2-inline-loading"
            role="status"
          >
            <span
              className="account-v2-spinner account-v2-spinner-small"
              aria-hidden="true"
            />

            Loading saved resources...
          </div>
        </section>
      )}

      <section className="account-v2-panel">
        <div className="account-v2-panel-heading">
          <div>
            <span>Recent purchases</span>
            <h2>
              Your latest resources
            </h2>

            <p>
              Recently purchased resources and their
              payment references.
            </p>
          </div>

          <Link to="/account/receipts">
            View receipts
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        {recentPurchases.length > 0 ? (
          <div className="account-v2-purchase-list">
            <div
              className="account-v2-purchase-labels"
              aria-hidden="true"
            >
              <span>Resource</span>
              <span>Purchased</span>
              <span>Price</span>
              <span>Access</span>
            </div>

            {recentPurchases.map(
              (
                item,
                index
              ) => (
                <article
                  className="account-v2-purchase-row"
                  key={`${item.orderId}-${item.id || item.slug}-${index}`}
                >
                  <div className="account-v2-purchase-resource">
                    <ResourceImage resource={item} />

                    <div>
                      <strong>{item.title}</strong>

                      <span>
                        {item.category} / {item.type}
                      </span>

                      <small>
                        {item.orderNumber}
                      </small>
                    </div>
                  </div>

                  <span>
                    {formatDate(item.purchaseDate)}
                  </span>

                  <strong>
                    {formatMoney(item.price)}
                  </strong>

                  <Link
                    to={`/account/reader/${item.slug}`}
                  >
                    Open
                    <FiArrowRight aria-hidden="true" />
                  </Link>
                </article>
              )
            )}
          </div>
        ) : (
          <div className="account-v2-empty account-v2-empty-compact">
            <span>
              <FiShoppingBag aria-hidden="true" />
            </span>

            <h3>
              No completed purchases yet
            </h3>

            <p>
              Paid resources will appear here automatically
              after a successful order.
            </p>

            <Link to="/resources">
              Browse resources
            </Link>
          </div>
        )}
      </section>

      <section className="account-v2-confidence">
        <span>
          <FiCheckCircle aria-hidden="true" />
        </span>

        <div>
          <strong>
            Your purchased resources stay available in your library
          </strong>

          <p>
            Return at any time to read online, download supported
            files, or review payment receipts.
          </p>
        </div>
      </section>
    </main>
  );
}

export default AccountDashboard;
