import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FiArrowUpRight,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiCreditCard,
  FiHeart,
  FiImage,
  FiMoreVertical,
  FiRefreshCcw,
  FiShoppingBag,
  FiStar,
} from "react-icons/fi";

import { resources as localResources } from "../../data/resources.js";
import { useResources } from "../../hooks/useResources.js";
import { useWishlist } from "../../hooks/useWishlist.js";
import { resourceService } from "../../services/resourceService.js";
import { normalizeRemoteResource } from "../../utils/resourceMapper.js";

import "./ProductDetails.css";

const defaultBenefits = [
  "Instant access after purchase",
  "Read online from your library",
  "Practical digital resource",
];

const defaultIncluded = [
  "Digital PDF resource",
  "Step-by-step guidance",
  "Practical templates or checklists where applicable",
];

function formatMoney(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-US")}`;
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
    value.path,
  ];

  return (
    possibleUrls.find(
      (url) =>
        typeof url === "string" &&
        url.trim()
    )?.trim() || ""
  );
}

function collectImageUrls(resource) {
  if (!resource) {
    return [];
  }

  const galleryValues = Array.isArray(resource.gallery)
    ? resource.gallery
    : [];

  const possibleImages = [
    resource.coverImage,
    resource.image,
    resource.mainImage,
    resource.thumbnail,
    ...galleryValues,
    resource.hoverImage,
  ];

  return [
    ...new Set(
      possibleImages
        .map(extractImageUrl)
        .filter(Boolean)
    ),
  ];
}

function ResourceImage({
  sources,
  alt,
  className = "",
  placeholderClassName = "",
  loading = "lazy",
}) {
  const normalizedSources = Array.isArray(sources)
    ? sources.filter(Boolean)
    : [];

  const sourceKey = normalizedSources.join("|");

  const [
    sourceIndex,
    setSourceIndex,
  ] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [sourceKey]);

  const source =
    normalizedSources[sourceIndex];

  if (!source) {
    return (
      <span
        className={placeholderClassName}
        aria-label={`${alt || "Resource"} image unavailable`}
      >
        <FiImage aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={source}
      alt={alt || "SkillVault resource"}
      className={className}
      loading={loading}
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

function RatingStars({ rating }) {
  const numericRating = Number(rating || 0);
  const roundedRating = Math.round(numericRating);

  return (
    <div
      className="pdv-rating"
      aria-label={`${numericRating.toFixed(1)} star rating`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <FiStar
          key={index}
          aria-hidden="true"
          className={index < roundedRating ? "is-filled" : ""}
        />
      ))}
    </div>
  );
}


function getReviewerInitials(name) {
  if (!name?.trim()) {
    return "SV";
  }

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatReviewTime(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const differenceInSeconds =
    Math.round(
      (date.getTime() - Date.now()) / 1000
    );

  const formatter =
    new Intl.RelativeTimeFormat(
      "en",
      {
        numeric: "auto",
      }
    );

  const ranges = [
    {
      limit: 60,
      divisor: 1,
      unit: "second",
    },
    {
      limit: 60,
      divisor: 60,
      unit: "minute",
    },
    {
      limit: 24,
      divisor: 60 * 60,
      unit: "hour",
    },
    {
      limit: 7,
      divisor: 60 * 60 * 24,
      unit: "day",
    },
    {
      limit: 5,
      divisor: 60 * 60 * 24 * 7,
      unit: "week",
    },
    {
      limit: 12,
      divisor: 60 * 60 * 24 * 30,
      unit: "month",
    },
  ];

  for (const range of ranges) {
    const valueForUnit =
      differenceInSeconds /
      range.divisor;

    if (
      Math.abs(valueForUnit) <
      range.limit
    ) {
      return formatter.format(
        Math.round(valueForUnit),
        range.unit
      );
    }
  }

  return formatter.format(
    Math.round(
      differenceInSeconds /
        (
          60 *
          60 *
          24 *
          365
        )
    ),
    "year"
  );
}

function normalizeReview(
  review,
  index,
  fallbackRating
) {
  if (
    typeof review ===
    "string"
  ) {
    return {
      id: `review-${index}`,
      name:
        "SkillVault customer",
      text: review,
      rating:
        Number(
          fallbackRating || 5
        ),
      time:
        "Recently",
      verified:
        true,
      avatar:
        "",
    };
  }

  const name =
    review?.reviewerName ||
    review?.customerName ||
    review?.name ||
    review?.author ||
    "SkillVault customer";

  const text =
    review?.comment ||
    review?.text ||
    review?.body ||
    review?.review ||
    "";

  return {
    id:
      review?.id ||
      `review-${index}`,
    name,
    text,
    rating:
      Number(
        review?.rating ||
        fallbackRating ||
        5
      ),
    time:
      formatReviewTime(
        review?.createdAt ||
        review?.date ||
        review?.updatedAt
      ),
    verified:
      review?.verifiedPurchase ??
      review?.verified ??
      true,
    avatar:
      extractImageUrl(
        review?.avatar ||
        review?.photo
      ),
  };
}

function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { resources, addToBasket } = useResources();

  const {
    requestWishlist,
    isWishlisted,
    isWishlistBusy,
  } = useWishlist();

  const [product, setProduct] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  const loadProduct = async () => {
    setIsLoadingProduct(true);
    setProductError("");

    try {
      const response = await resourceService.getPublished(slug);

      const localFallback = localResources.find(
        (item) => item.slug === slug
      );

      const normalizedProduct = normalizeRemoteResource(
        response.data.resource,
        localFallback
      );

      const productImages =
        collectImageUrls(normalizedProduct);

      setProduct(normalizedProduct);
      setSelectedImage(productImages[0] || "");
    } catch (error) {
      setProduct(null);
      setSelectedImage("");
      setProductError(error.message);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const relatedResources = useMemo(() => {
    if (!product) {
      return [];
    }

    const sameCategory = resources.filter(
      (item) =>
        item.category === product.category &&
        item.slug !== product.slug
    );

    const fallback = resources.filter(
      (item) => item.slug !== product.slug
    );

    const uniqueBySlug = new Map();

    for (const item of [...sameCategory, ...fallback]) {
      if (!uniqueBySlug.has(item.slug)) {
        uniqueBySlug.set(item.slug, item);
      }
    }

    return [...uniqueBySlug.values()].slice(0, 4);
  }, [resources, product]);

  const galleryImages = useMemo(
    () => collectImageUrls(product).slice(0, 8),
    [product]
  );

  useEffect(() => {
    if (
      galleryImages.length > 0 &&
      !galleryImages.includes(selectedImage)
    ) {
      setSelectedImage(galleryImages[0]);
    }
  }, [galleryImages, selectedImage]);

  const descriptionParagraphs = useMemo(() => {
    if (!product) {
      return [];
    }

    const description =
      product.description ||
      product.shortDescription ||
      "More information about this resource will be added soon.";

    return description
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [product]);

  const benefits = product?.benefits?.length
    ? product.benefits
    : defaultBenefits;

  const included = product?.included?.length
    ? product.included
    : defaultIncluded;

  const reviews = useMemo(
    () =>
      (
        product?.reviews ||
        []
      )
        .filter(Boolean)
        .map(
          (
            review,
            index
          ) =>
            normalizeReview(
              review,
              index,
              product?.rating
            )
        )
        .filter(
          (review) =>
            review.text
        ),
    [
      product?.reviews,
      product?.rating,
    ]
  );

  const handleBuyNow = () => {
    addToBasket(product);
    navigate("/checkout");
  };

  const handleWishlist = () => {
    requestWishlist(
      product,
      `${location.pathname}${location.search}`
    );
  };

  if (isLoadingProduct) {
    return (
      <main className="pdv-page">
        <div className="container">
          <div className="pdv-loading" role="status">
            <span className="pdv-spinner" aria-hidden="true" />
            <h1>Loading resource</h1>
            <p>
              Please wait while SkillVault retrieves the latest product
              information.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pdv-page">
        <div className="container">
          <div className="pdv-not-found">
            <FiBookOpen aria-hidden="true" />
            <h1>Resource not found</h1>
            <p>
              {productError ||
                "The resource may have been unpublished, renamed, or removed."}
            </p>

            <div className="pdv-not-found-actions">
              <button type="button" onClick={loadProduct}>
                <FiRefreshCcw aria-hidden="true" />
                Try again
              </button>

              <Link to="/resources">Back to resources</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const mainImage =
    selectedImage ||
    galleryImages[0] ||
    "";

  const mainImageSources = [
    mainImage,
    ...galleryImages.filter(
      (image) => image !== mainImage
    ),
  ].filter(Boolean);

  const hasDiscount =
    Number(product.oldPrice) > Number(product.price);

  const reviewCount =
    Number(product.reviewCount || reviews.length || 0);

  const saved = isWishlisted(product.id);
  const wishlistBusy = isWishlistBusy(product.id);

  return (
    <main className="pdv-page">
      <div className="container">
        <nav className="pdv-breadcrumb" aria-label="Breadcrumb">
          <Link to="/resources">Resources</Link>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <strong>{product.title}</strong>
        </nav>

        <section className="pdv-hero">
          <div
            className={`pdv-gallery ${
              galleryImages.length > 1
                ? "has-thumbnails"
                : "is-single-image"
            }`}
          >
            {galleryImages.length > 1 && (
              <div
                className="pdv-thumbnails"
                aria-label="Product gallery"
                data-count={`${galleryImages.length} images`}
              >
                {galleryImages.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={mainImage === image ? "is-active" : ""}
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View resource image ${index + 1}`}
                  >
                    <ResourceImage
                      sources={[image]}
                      alt=""
                      loading="lazy"
                      placeholderClassName="pdv-image-placeholder"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="pdv-main-image">
              <ResourceImage
                sources={mainImageSources}
                alt={product.title}
                loading="eager"
                placeholderClassName="pdv-image-placeholder"
              />
            </div>
          </div>

          <aside className="pdv-summary">
            <div className="pdv-summary-topline">
              <span className="pdv-category">
                {product.category}
                {product.type ? ` / ${product.type}` : ""}
              </span>

              {product.badge && (
                <span className="pdv-badge">{product.badge}</span>
              )}
            </div>

            <h1>{product.title}</h1>

            <div className="pdv-rating-row">
              <RatingStars rating={product.rating} />

              <span>
                {Number(product.rating || 0).toFixed(1)}
                {reviewCount > 0 &&
                  ` · ${reviewCount} review${
                    reviewCount === 1 ? "" : "s"
                  }`}
              </span>
            </div>

            <p className="pdv-short-description">
              {product.shortDescription || product.description}
            </p>

            <div className="pdv-price-row">
              <strong>{formatMoney(product.price)}</strong>

              {hasDiscount && (
                <del>{formatMoney(product.oldPrice)}</del>
              )}
            </div>

            <div className="pdv-benefits">
              {benefits.slice(0, 4).map((benefit, index) => (
                <div key={`${product.slug}-benefit-${index}`}>
                  <span aria-hidden="true">
                    <FiCheck />
                  </span>

                  <p>{benefit}</p>
                </div>
              ))}
            </div>

            <div className="pdv-purchase-actions">
              <button
                type="button"
                className="pdv-add-button"
                onClick={() => addToBasket(product)}
              >
                <FiShoppingBag aria-hidden="true" />
                Add to basket
              </button>

              <button
                type="button"
                className="pdv-buy-button"
                onClick={handleBuyNow}
              >
                <FiCreditCard aria-hidden="true" />
                Buy now
              </button>
            </div>

            <button
              type="button"
              className={`pdv-wishlist-button ${
                saved ? "is-saved" : ""
              }`}
              onClick={handleWishlist}
              disabled={wishlistBusy}
              aria-pressed={saved}
            >
              {wishlistBusy ? (
                <FiRefreshCcw
                  className="pdv-wishlist-spinner"
                  aria-hidden="true"
                />
              ) : (
                <FiHeart aria-hidden="true" />
              )}

              {wishlistBusy
                ? "Updating wishlist..."
                : saved
                  ? "Saved to wishlist"
                  : "Save to wishlist"}
            </button>

            <div className="pdv-summary-details">
              <div>
                <span>Format</span>
                <strong>{product.type || "Digital resource"}</strong>
              </div>

              <div>
                <span>Access</span>
                <strong>Instant digital access</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{product.category}</strong>
              </div>
            </div>
          </aside>
        </section>

        <section
          className="pdv-simple-section"
          aria-labelledby="pdv-about-title"
        >
          <h2 id="pdv-about-title">About this resource</h2>

          <div className="pdv-description">
            {descriptionParagraphs.map((paragraph, index) => (
              <p key={`${product.slug}-description-${index}`}>
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section
          className="pdv-simple-section"
          aria-labelledby="pdv-included-title"
        >
          <h2 id="pdv-included-title">What is included</h2>

          <div className="pdv-included-list">
            {included.map((item, index) => (
              <div key={`${product.slug}-included-${index}`}>
                <FiCheck aria-hidden="true" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="pdv-simple-section"
          aria-labelledby="pdv-reviews-title"
        >
          <div className="pdv-simple-heading-row">
            <h2 id="pdv-reviews-title">Reviews</h2>

            <div className="pdv-review-summary">
              <RatingStars rating={product.rating} />
              <span>
                {Number(product.rating || 0).toFixed(1)} · {reviewCount} review
                {reviewCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="pdv-review-list">
              {reviews.map((review) => (
                <article
                  className="pdv-review"
                  key={review.id}
                >
                  <div className="pdv-review-header">
                    {review.avatar ? (
                      <img
                        src={review.avatar}
                        alt=""
                        className="pdv-review-avatar"
                      />
                    ) : (
                      <span
                        className="pdv-review-avatar"
                        aria-hidden="true"
                      >
                        {getReviewerInitials(
                          review.name
                        )}
                      </span>
                    )}

                    <div className="pdv-review-identity">
                      <strong>
                        {review.name}
                      </strong>

                      <small>
                        {review.verified
                          ? "Verified purchase"
                          : "SkillVault customer"}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="pdv-review-menu"
                      aria-label="More review options"
                    >
                      <FiMoreVertical aria-hidden="true" />
                    </button>
                  </div>

                  <div className="pdv-review-rating-line">
                    <RatingStars
                      rating={review.rating}
                    />

                    <span>
                      {review.time}
                    </span>
                  </div>

                  <p className="pdv-review-text">
                    {review.text}
                  </p>

                  {review.verified && (
                    <span className="pdv-review-verified">
                      <FiCheckCircle aria-hidden="true" />
                      Verified purchase
                    </span>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="pdv-review-empty">
              <FiStar aria-hidden="true" />

              <div>
                <h3>No reviews yet</h3>
                <p>
                  Customer feedback will appear here after verified purchases.
                </p>
              </div>
            </div>
          )}
        </section>

        {relatedResources.length > 0 && (
          <section
            className="pdv-related-section"
            aria-labelledby="pdv-related-title"
          >
            <div className="pdv-simple-heading-row">
              <h2 id="pdv-related-title">Related resources</h2>

              <Link to="/resources">
                View all resources
                <FiArrowUpRight aria-hidden="true" />
              </Link>
            </div>

            <div className="pdv-related-grid">
              {relatedResources.map((item) => {
                const relatedImages =
                  collectImageUrls(item);

                return (
                  <article
                    className="pdv-related-card"
                    key={item.id || item.slug}
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      className="pdv-related-image"
                    >
                      <ResourceImage
                        sources={relatedImages}
                        alt={item.title}
                        placeholderClassName="pdv-related-placeholder"
                      />
                    </Link>

                    <div className="pdv-related-content">
                      <span>{item.category}</span>

                      <h3>
                        <Link to={`/product/${item.slug}`}>
                          {item.title}
                        </Link>
                      </h3>

                      <div>
                        <strong>{formatMoney(item.price)}</strong>

                        <Link to={`/product/${item.slug}`}>
                          View resource
                          <FiArrowUpRight aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default ProductDetails;
