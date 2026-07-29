import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiHeart,
  FiImage,
  FiRefreshCcw,
  FiSearch,
  FiX,
} from "react-icons/fi";

import {
  useWishlist,
} from "../../../hooks/useWishlist.js";

import {
  accountDashboardService,
} from "../../../services/accountDashboardService.js";

import "./MyLibrary.css";

const filterOptions = [
  "All",
  "In Progress",
  "Completed",
  "Downloads",
];

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

function getResourceStatus(progress) {
  const numericProgress = Number(progress || 0);

  if (numericProgress >= 100) {
    return "Completed";
  }

  if (numericProgress > 0) {
    return "In Progress";
  }

  return "Not Started";
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

function getImageCandidates(resource) {
  return [
    extractImageUrl(resource?.coverImage),
    extractImageUrl(resource?.image),
    extractImageUrl(resource?.thumbnail),
    extractImageUrl(resource?.gallery?.[0]),
  ].filter(Boolean);
}

function ResourceCover({
  resource,
  className = "",
}) {
  const candidates = getImageCandidates(resource);
  const candidateKey = candidates.join("|");

  const [
    candidateIndex,
    setCandidateIndex,
  ] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidateKey]);

  const source = candidates[candidateIndex];

  if (!source) {
    return (
      <div
        className={`library-v2-image-placeholder ${className}`}
        aria-label={`${resource?.title || "Resource"} has no cover image`}
      >
        <FiImage aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={source}
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

function MyLibrary() {
  const {
    wishlistCount,
    isWishlistLoading,
  } = useWishlist();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [
    libraryItems,
    setLibraryItems,
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const requestedFilter =
    searchParams.get("filter");

  const initialFilter =
    requestedFilter === "downloads"
      ? "Downloads"
      : "All";

  const [
    activeFilter,
    setActiveFilter,
  ] = useState(initialFilter);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    pageMessage,
    setPageMessage,
  ] = useState("");

  const [
    downloadingResourceId,
    setDownloadingResourceId,
  ] = useState(null);

  const loadLibrary = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const response =
        await accountDashboardService.getDashboard();

      const resources =
        response.data.dashboard
          .purchasedResources || [];

      setLibraryItems(resources);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  useEffect(() => {
    if (requestedFilter === "downloads") {
      setActiveFilter("Downloads");
    }
  }, [requestedFilter]);

  const librarySummary = useMemo(() => {
    return libraryItems.reduce(
      (summary, item) => {
        const progress = Number(item.progress || 0);

        summary.total += 1;

        if (progress >= 100) {
          summary.completed += 1;
        } else if (progress > 0) {
          summary.inProgress += 1;
        }

        if (item.canDownload) {
          summary.downloads += 1;
        }

        return summary;
      },
      {
        total: 0,
        completed: 0,
        inProgress: 0,
        downloads: 0,
      }
    );
  }, [libraryItems]);

  const continueReading = useMemo(
    () =>
      libraryItems
        .filter(
          (item) =>
            Number(item.progress) > 0 &&
            Number(item.progress) < 100
        )
        .slice(0, 3),
    [libraryItems]
  );

  const featuredReading =
    continueReading[0] || null;

  const additionalReading =
    continueReading.slice(1);

  const filteredItems = useMemo(() => {
    const normalizedSearch =
      searchTerm
        .trim()
        .toLowerCase();

    return libraryItems.filter((item) => {
      const status =
        getResourceStatus(item.progress);

      const matchesFilter =
        activeFilter === "All" ||
        (
          activeFilter === "Downloads" &&
          item.canDownload
        ) ||
        status === activeFilter;

      const searchableText = [
        item.title,
        item.category,
        item.type,
        item.shortDescription,
        item.description,
        item.orderNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(
          normalizedSearch
        );

      return matchesFilter && matchesSearch;
    });
  }, [
    libraryItems,
    searchTerm,
    activeFilter,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setActiveFilter("All");
    setSearchParams({});
  };

  const changeFilter = (filter) => {
    setActiveFilter(filter);

    if (filter === "Downloads") {
      setSearchParams({
        filter: "downloads",
      });
    } else {
      setSearchParams({});
    }
  };

  const downloadResource = async (item) => {
    if (!item.id || !item.canDownload) {
      return;
    }

    setDownloadingResourceId(item.id);
    setPageError("");
    setPageMessage("");

    try {
      const response =
        await accountDashboardService.getDownload(
          item.id
        );

      const download =
        response.data.download;

      const anchor =
        document.createElement("a");

      anchor.href = download.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.download =
        download.fileName || "";

      document.body.appendChild(anchor);

      anchor.click();
      anchor.remove();

      setPageMessage(
        `${item.title} is ready to download. The private link expires in ten minutes.`
      );
    } catch (error) {
      setPageError(error.message);
    } finally {
      setDownloadingResourceId(null);
    }
  };

  if (isLoading) {
    return (
      <section
        className="library-v2-loading"
        role="status"
        aria-live="polite"
      >
        <span
          className="library-v2-spinner"
          aria-hidden="true"
        />

        <h1>Loading your library</h1>

        <p>
          We are retrieving your purchased resources,
          reading progress, and available downloads.
        </p>
      </section>
    );
  }

  return (
    <main className="library-v2-page">
      {pageError && (
        <div
          className="library-v2-message is-error"
          role="alert"
        >
          <FiRefreshCcw aria-hidden="true" />

          <div>
            <strong>
              Something needs attention
            </strong>
            <span>{pageError}</span>
          </div>

          <button
            type="button"
            onClick={() => setPageError("")}
            aria-label="Dismiss error"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      {pageMessage && (
        <div
          className="library-v2-message is-success"
          role="status"
        >
          <FiCheckCircle aria-hidden="true" />

          <div>
            <strong>Download ready</strong>
            <span>{pageMessage}</span>
          </div>

          <button
            type="button"
            onClick={() => setPageMessage("")}
            aria-label="Dismiss message"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      <section className="library-v2-hero">
        <div>
          <span>My library</span>
          <h1>Your purchased resources</h1>

          <p>
            Read online, continue where you stopped,
            securely download available files, and manage
            your complete SkillVault collection.
          </p>
        </div>

        <div className="library-v2-hero-actions">
          <Link
            to="/account/wishlist"
            className="library-v2-hero-secondary"
          >
            <FiHeart aria-hidden="true" />
            Wishlist
            <strong>
              {isWishlistLoading
                ? "..."
                : wishlistCount}
            </strong>
          </Link>

          <Link
            to="/resources"
            className="library-v2-hero-primary"
          >
            Explore more
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        className="library-v2-summary"
        aria-label="Library summary"
      >
        <article>
          <span>
            <FiBookOpen aria-hidden="true" />
          </span>

          <div>
            <strong>{librarySummary.total}</strong>
            <small>Purchased resources</small>
          </div>
        </article>

        <article>
          <span>
            <FiClock aria-hidden="true" />
          </span>

          <div>
            <strong>
              {librarySummary.inProgress}
            </strong>
            <small>In progress</small>
          </div>
        </article>

        <article>
          <span>
            <FiCheckCircle aria-hidden="true" />
          </span>

          <div>
            <strong>
              {librarySummary.completed}
            </strong>
            <small>Completed</small>
          </div>
        </article>

        <article>
          <span>
            <FiDownload aria-hidden="true" />
          </span>

          <div>
            <strong>
              {librarySummary.downloads}
            </strong>
            <small>Available downloads</small>
          </div>
        </article>
      </section>

      {featuredReading && (
        <section className="library-v2-section">
          <div className="library-v2-section-heading">
            <div>
              <span>Continue reading</span>
              <h2>Pick up where you stopped</h2>

              <p>
                Your reading position and progress are
                saved automatically.
              </p>
            </div>

            <Link to="/account/library">
              View full library
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className="library-v2-continue-layout">
            <article className="library-v2-featured-reading">
              <Link
                to={`/account/reader/${featuredReading.slug}`}
                className="library-v2-featured-cover"
              >
                <ResourceCover
                  resource={featuredReading}
                />
              </Link>

              <div className="library-v2-featured-copy">
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
                  Return to your latest resource and continue
                  from your most recent reading position.
                </p>

                <div className="library-v2-progress-label">
                  <span>Reading progress</span>
                  <strong>
                    {featuredReading.progress}%
                  </strong>
                </div>

                <div
                  className="library-v2-progress"
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
                  className="library-v2-read-action"
                >
                  Continue reading
                  <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
            </article>

            {additionalReading.length > 0 && (
              <div className="library-v2-continue-list">
                {additionalReading.map((item) => (
                  <article
                    key={item.id || item.slug}
                  >
                    <Link
                      to={`/account/reader/${item.slug}`}
                      className="library-v2-small-cover"
                    >
                      <ResourceCover resource={item} />
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

                      <div className="library-v2-small-progress">
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
        </section>
      )}

      <section className="library-v2-collection">
        <div className="library-v2-collection-header">
          <div>
            <span>Full collection</span>
            <h2>Your SkillVault resources</h2>

            <p>
              Search, filter, read, or download resources
              included in your account.
            </p>
          </div>

          <strong>
            {filteredItems.length} resource
            {filteredItems.length === 1 ? "" : "s"}
          </strong>
        </div>

        <div className="library-v2-toolbar">
          <label className="library-v2-search">
            <FiSearch aria-hidden="true" />

            <input
              type="search"
              placeholder="Search title, category, type, or order..."
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

          <div className="library-v2-filter-tabs">
            {filterOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={
                  activeFilter === option
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  changeFilter(option)
                }
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="library-v2-refresh"
            onClick={loadLibrary}
            title="Refresh library"
          >
            <FiRefreshCcw aria-hidden="true" />
            Refresh
          </button>
        </div>

        {filteredItems.length > 0 ? (
          <div className="library-v2-grid">
            {filteredItems.map((item) => {
              const status =
                getResourceStatus(item.progress);

              const description =
                item.shortDescription ||
                item.description ||
                "A purchased SkillVault digital resource.";

              const statusClass =
                status
                  .toLowerCase()
                  .replaceAll(" ", "-");

              return (
                <article
                  className="library-v2-card"
                  key={item.id || item.slug}
                >
                  <div className="library-v2-card-cover">
                    <Link
                      to={`/account/reader/${item.slug}`}
                    >
                      <ResourceCover resource={item} />
                    </Link>

                    <span
                      className={`library-v2-status is-${statusClass}`}
                    >
                      {status === "Completed" && (
                        <FiCheckCircle aria-hidden="true" />
                      )}

                      {status === "In Progress" && (
                        <FiClock aria-hidden="true" />
                      )}

                      {status === "Not Started" && (
                        <FiBookOpen aria-hidden="true" />
                      )}

                      {status}
                    </span>
                  </div>

                  <div className="library-v2-card-copy">
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

                    <p>{description}</p>

                    <div className="library-v2-card-meta">
                      <span>
                        Purchased{" "}
                        {formatDate(item.purchaseDate)}
                      </span>

                      <strong>
                        {item.progress}%
                      </strong>
                    </div>

                    <div
                      className="library-v2-progress library-v2-card-progress"
                      aria-label={`${item.progress}% complete`}
                    >
                      <span
                        style={{
                          width:
                            `${item.progress}%`,
                        }}
                      />
                    </div>

                    <div className="library-v2-card-actions">
                      <Link
                        to={`/account/reader/${item.slug}`}
                      >
                        <FiEye aria-hidden="true" />
                        Read online
                      </Link>

                      {item.canDownload && item.id ? (
                        <button
                          type="button"
                          onClick={() =>
                            downloadResource(item)
                          }
                          disabled={
                            downloadingResourceId ===
                            item.id
                          }
                        >
                          {downloadingResourceId ===
                          item.id ? (
                            <span
                              className="library-v2-spinner library-v2-spinner-small"
                              aria-hidden="true"
                            />
                          ) : (
                            <FiDownload aria-hidden="true" />
                          )}

                          {downloadingResourceId ===
                          item.id
                            ? "Preparing..."
                            : "Download"}
                        </button>
                      ) : (
                        <span className="library-v2-online-only">
                          Online only
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : libraryItems.length === 0 ? (
          <div className="library-v2-empty">
            <span>
              <FiBookOpen aria-hidden="true" />
            </span>

            <h3>
              Your library is ready for its first resource
            </h3>

            <p>
              Completed purchases will appear here
              automatically.
            </p>

            <Link to="/resources">
              Browse resources
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="library-v2-empty">
            <span>
              <FiSearch aria-hidden="true" />
            </span>

            <h3>No matching resources</h3>

            <p>
              Try another search term or switch to a
              different library filter.
            </p>

            <button
              type="button"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default MyLibrary;
