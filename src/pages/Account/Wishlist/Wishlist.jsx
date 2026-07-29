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
  FiEye,
  FiHeart,
  FiImage,
  FiRefreshCcw,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";

import {
  useResources,
} from "../../../hooks/useResources.js";

import {
  useWishlist,
} from "../../../hooks/useWishlist.js";

import "./Wishlist.css";

function formatMoney(amount) {
  return `KSh ${Number(
    amount || 0
  ).toLocaleString("en-US")}`;
}

function formatSavedDate(value) {
  if (!value) {
    return "Recently";
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

function getImageCandidates(item) {
  return [
    extractImageUrl(item?.coverImage),
    extractImageUrl(item?.image),
    extractImageUrl(item?.thumbnail),
    extractImageUrl(item?.gallery?.[0]),
  ].filter(Boolean);
}

function WishlistImage({
  item,
}) {
  const candidates =
    getImageCandidates(item);

  const candidateKey =
    candidates.join("|");

  const [
    candidateIndex,
    setCandidateIndex,
  ] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidateKey]);

  const source =
    candidates[candidateIndex];

  if (!source) {
    return (
      <div className="wishlist-v2-image-placeholder">
        <FiImage aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={source}
      alt={
        item?.title ||
        "SkillVault resource"
      }
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

function Wishlist() {
  const {
    addToBasket,
  } = useResources();

  const {
    wishlistItems,
    wishlistCount,
    isWishlistLoading,
    wishlistError,
    removeFromWishlist,
    isWishlistBusy,
    reloadWishlist,
  } = useWishlist();

  const totalWishlistValue =
    useMemo(
      () =>
        wishlistItems.reduce(
          (total, item) =>
            total +
            Number(item.price || 0),
          0
        ),
      [wishlistItems]
    );

  const discountedItems =
    useMemo(
      () =>
        wishlistItems.filter(
          (item) =>
            Number(item.oldPrice) >
            Number(item.price)
        ).length,
      [wishlistItems]
    );

  if (
    isWishlistLoading &&
    wishlistItems.length === 0
  ) {
    return (
      <section
        className="wishlist-v2-loading"
        role="status"
        aria-live="polite"
      >
        <span
          className="wishlist-v2-spinner"
          aria-hidden="true"
        />

        <h1>Loading your wishlist</h1>

        <p>
          SkillVault is retrieving your saved
          resources.
        </p>
      </section>
    );
  }

  if (
    wishlistItems.length === 0
  ) {
    return (
      <main className="wishlist-v2-page">
        {wishlistError && (
          <div
            className="wishlist-v2-message"
            role="alert"
          >
            <FiRefreshCcw aria-hidden="true" />

            <div>
              <strong>
                Your wishlist could not be refreshed
              </strong>

              <span>{wishlistError}</span>
            </div>

            <button
              type="button"
              onClick={reloadWishlist}
            >
              <FiRefreshCcw aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        <section className="wishlist-v2-empty-hero">
          <div className="wishlist-v2-empty-icon">
            <FiHeart aria-hidden="true" />
          </div>

          <span>Wishlist</span>

          <h1>No saved resources yet</h1>

          <p>
            Save guides, templates, planners, and
            playbooks while browsing. Your choices
            will stay available whenever you sign in.
          </p>

          <Link to="/resources">
            Browse resources
            <FiArrowRight aria-hidden="true" />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="wishlist-v2-page">
      <section className="wishlist-v2-hero">
        <div>
          <span>Wishlist</span>

          <h1>Saved resources for later</h1>

          <p>
            Review the guides, templates, planners,
            and playbooks you are considering before
            adding them to your basket.
          </p>
        </div>

        <Link to="/resources">
          Browse resources
          <FiArrowRight aria-hidden="true" />
        </Link>
      </section>

      {wishlistError && (
        <div
          className="wishlist-v2-message"
          role="alert"
        >
          <FiRefreshCcw aria-hidden="true" />

          <div>
            <strong>
              Your wishlist needs attention
            </strong>

            <span>{wishlistError}</span>
          </div>

          <button
            type="button"
            onClick={reloadWishlist}
          >
            <FiRefreshCcw aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      <section
        className="wishlist-v2-summary"
        aria-label="Wishlist summary"
      >
        <article className="is-featured">
          <span>
            <FiShoppingCart aria-hidden="true" />
          </span>

          <div>
            <small>Total wishlist value</small>

            <strong>
              {formatMoney(
                totalWishlistValue
              )}
            </strong>

            <p>
              Combined value of all saved resources.
            </p>
          </div>
        </article>

        <article>
          <span>
            <FiHeart aria-hidden="true" />
          </span>

          <div>
            <small>Saved resources</small>
            <strong>{wishlistCount}</strong>
          </div>
        </article>

        <article>
          <span>
            <FiEye aria-hidden="true" />
          </span>

          <div>
            <small>Ready to review</small>
            <strong>{wishlistCount}</strong>
          </div>
        </article>

        <article>
          <span>
            <FiArrowRight aria-hidden="true" />
          </span>

          <div>
            <small>Discounted resources</small>
            <strong>{discountedItems}</strong>
          </div>
        </article>
      </section>

      <section className="wishlist-v2-panel">
        <div className="wishlist-v2-panel-heading">
          <div>
            <span>Your saved picks</span>

            <h2>
              Resources you may want to buy
            </h2>

            <p>
              Compare details, add resources to your
              basket, or remove items you no longer
              need.
            </p>
          </div>

          <div className="wishlist-v2-panel-count">
            <strong>{wishlistCount}</strong>

            <span>
              item
              {wishlistCount === 1
                ? ""
                : "s"}{" "}
              saved
            </span>
          </div>
        </div>

        <div className="wishlist-v2-grid">
          {wishlistItems.map(
            (item) => {
              const isBusy =
                isWishlistBusy(item.id);

              const hasDiscount =
                Number(item.oldPrice) >
                Number(item.price);

              const description =
                item.shortDescription ||
                item.description ||
                "A practical SkillVault digital resource.";

              return (
                <article
                  className="wishlist-v2-card"
                  key={item.id}
                >
                  <Link
                    to={`/product/${item.slug}`}
                    className="wishlist-v2-card-cover"
                  >
                    <WishlistImage item={item} />

                    <span className="wishlist-v2-saved-badge">
                      <FiHeart aria-hidden="true" />
                      Saved
                    </span>
                  </Link>

                  <div className="wishlist-v2-card-copy">
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

                    <p>{description}</p>

                    <div className="wishlist-v2-card-meta">
                      <span>
                        Saved{" "}
                        {formatSavedDate(
                          item.savedAt
                        )}
                      </span>

                      {hasDiscount && (
                        <strong>
                          Price reduced
                        </strong>
                      )}
                    </div>

                    <div className="wishlist-v2-price-row">
                      <strong>
                        {formatMoney(item.price)}
                      </strong>

                      {hasDiscount && (
                        <del>
                          {formatMoney(
                            item.oldPrice
                          )}
                        </del>
                      )}
                    </div>

                    <div className="wishlist-v2-card-actions">
                      <Link
                        to={`/product/${item.slug}`}
                      >
                        <FiEye aria-hidden="true" />
                        View details
                      </Link>

                      <button
                        type="button"
                        className="is-primary"
                        onClick={() =>
                          addToBasket(item)
                        }
                        disabled={isBusy}
                      >
                        <FiShoppingCart aria-hidden="true" />
                        Add to basket
                      </button>
                    </div>

                    <button
                      type="button"
                      className="wishlist-v2-remove"
                      onClick={() =>
                        removeFromWishlist(item)
                      }
                      disabled={isBusy}
                    >
                      {isBusy ? (
                        <span
                          className="wishlist-v2-spinner wishlist-v2-spinner-small"
                          aria-hidden="true"
                        />
                      ) : (
                        <FiTrash2 aria-hidden="true" />
                      )}

                      {isBusy
                        ? "Removing..."
                        : "Remove from wishlist"}
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </section>

      <section className="wishlist-v2-bottom-cta">
        <div>
          <span>Still exploring?</span>

          <h2>
            Find more practical resources
          </h2>

          <p>
            Browse more SkillVault guides and save
            the ones you may want to buy later.
          </p>
        </div>

        <Link to="/resources">
          Explore resources
          <FiArrowRight aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}

export default Wishlist;
