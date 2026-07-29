import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FiArrowUpRight,
  FiEye,
  FiImage,
  FiShoppingBag,
  FiStar,
} from "react-icons/fi";

import {
  useResources,
} from "../../../../hooks/useResources.js";

import "./FeaturedGuides.css";

const featuredSlugs = [
  "kenya-job-interview-playbook",
  "start-business-5000",
  "chatgpt-for-everyday-work",
  "budget-savings-planner",
];

function formatMoney(amount) {
  return `KSh ${Number(
    amount || 0
  ).toLocaleString("en-US")}`;
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

function getImageSources(resource) {
  return [
    extractImageUrl(resource?.coverImage),
    extractImageUrl(resource?.image),
    extractImageUrl(resource?.thumbnail),
    extractImageUrl(resource?.gallery?.[0]),
    extractImageUrl(resource?.hoverImage),
  ].filter(Boolean);
}

function FeaturedImage({
  resource,
}) {
  const sources =
    getImageSources(resource);

  const sourceKey =
    sources.join("|");

  const [
    sourceIndex,
    setSourceIndex,
  ] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [sourceKey]);

  const source =
    sources[sourceIndex];

  if (!source) {
    return (
      <span className="featured-image-placeholder">
        <FiImage aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={source}
      alt={resource.title}
      className="featured-main-image"
      loading="lazy"
      decoding="async"
      onError={() =>
        setSourceIndex(
          (currentIndex) =>
            currentIndex + 1
        )
      }
    />
  );
}

function RatingStars({
  rating,
}) {
  const safeRating =
    Math.max(
      0,
      Math.min(
        5,
        Number(rating) || 0
      )
    );

  const roundedRating =
    Math.round(safeRating);

  return (
    <div
      className="featured-rating"
      aria-label={`${safeRating.toFixed(1)} out of 5 stars`}
    >
      {Array.from(
        {
          length: 5,
        },
        (
          _,
          index
        ) => (
          <FiStar
            key={index}
            className={
              index < roundedRating
                ? "star-filled"
                : "star-empty"
            }
            aria-hidden="true"
          />
        )
      )}
    </div>
  );
}

function FeaturedGuides() {
  const {
    resources,
    addToBasket,
  } = useResources();

  const featuredGuides =
    useMemo(
      () =>
        featuredSlugs
          .map(
            (slug) =>
              resources.find(
                (resource) =>
                  resource.slug === slug
              )
          )
          .filter(Boolean),
      [resources]
    );

  return (
    <section
      className="featured-guides-section"
      aria-labelledby="featured-guides-title"
    >
      <div className="container">
        <div className="featured-intro">
          <div>
            <span className="featured-kicker">
              Selected resources
            </span>

            <h2 id="featured-guides-title">
              Practical guides for the work ahead
            </h2>
          </div>

          <div className="featured-intro-note">
            <p>
              A focused selection of useful tools for
              work, business, career growth, and
              everyday progress.
            </p>

            <Link
              to="/resources"
              className="featured-view-all"
            >
              Browse all resources
              <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="featured-grid">
          {featuredGuides.map(
            (
              guide,
              index
            ) => {
              const hasDiscount =
                Number(
                  guide.oldPrice
                ) >
                Number(
                  guide.price
                );

              return (
                <article
                  className="featured-card"
                  key={
                    guide.id ||
                    guide.slug
                  }
                >
                  <div className="featured-image-box">
                    <Link
                      to={`/product/${guide.slug}`}
                      className="featured-image-link"
                      aria-label={`View ${guide.title}`}
                    >
                      <FeaturedImage
                        resource={
                          guide
                        }
                      />
                    </Link>

                    {guide.badge && (
                      <span className="featured-badge">
                        {guide.badge}
                      </span>
                    )}

                    <Link
                      to={`/product/${guide.slug}`}
                      className="featured-preview-action"
                      aria-label={`Preview ${guide.title}`}
                    >
                      <FiEye aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="featured-content">
                    <div className="featured-card-topline">
                      <span className="featured-category">
                        {guide.category}
                        {guide.type
                          ? ` / ${guide.type}`
                          : ""}
                      </span>

                      <span className="featured-card-index">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>

                    <h3>
                      <Link
                        to={`/product/${guide.slug}`}
                      >
                        {guide.title}
                      </Link>
                    </h3>

                    {guide.author && (
                      <p className="featured-author">
                        By {guide.author}
                      </p>
                    )}

                    <div className="featured-meta-row">
                      <RatingStars
                        rating={
                          guide.rating
                        }
                      />

                      <span className="featured-rating-number">
                        {Number(
                          guide.rating || 0
                        ).toFixed(
                          1
                        )}
                      </span>
                    </div>

                    <div className="featured-card-footer">
                      <div className="featured-price-row">
                        <strong className="featured-price">
                          {formatMoney(
                            guide.price
                          )}
                        </strong>

                        {hasDiscount && (
                          <del className="featured-old-price">
                            {formatMoney(
                              guide.oldPrice
                            )}
                          </del>
                        )}
                      </div>

                      <button
                        type="button"
                        className="featured-add-button"
                        onClick={() =>
                          addToBasket(
                            guide
                          )
                        }
                      >
                        <FiShoppingBag aria-hidden="true" />
                        Add to basket
                      </button>
                    </div>

                    <Link
                      to={`/product/${guide.slug}`}
                      className="featured-details-link"
                    >
                      View resource
                      <FiArrowUpRight aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}

export default FeaturedGuides;
