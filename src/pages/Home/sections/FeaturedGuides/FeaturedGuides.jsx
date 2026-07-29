import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiBarChart2,
  FiEye,
  FiHeart,
  FiShoppingBag,
  FiStar,
} from "react-icons/fi";

import { useResources } from "../../../../hooks/useResources.js";

import "./FeaturedGuides.css";

const featuredSlugs = [
  "kenya-job-interview-playbook",
  "start-business-5000",
  "chatgpt-for-everyday-work",
  "budget-savings-planner",
];

function RatingStars({ rating }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div
      className="featured-rating"
      aria-label={`${safeRating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <FiStar
          key={index}
          className={index < safeRating ? "star-filled" : "star-empty"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function FeaturedGuides() {
  const { resources, addToBasket } = useResources();

  const featuredGuides = featuredSlugs
    .map((slug) => resources.find((resource) => resource.slug === slug))
    .filter(Boolean);

  return (
    <section
      className="featured-guides-section"
      aria-labelledby="featured-guides-title"
    >
      <div className="container">
        <div className="featured-intro">
          <div className="featured-intro-topline">
            <span className="featured-kicker">Fresh from SkillVault</span>

            <span className="featured-selection-count">
              {featuredGuides.length || featuredSlugs.length} selected resources
            </span>
          </div>

          <div className="featured-intro-copy">
            <h2 id="featured-guides-title">
              Useful knowledge, selected for the work ahead.
            </h2>

            <div className="featured-intro-note">
              <p>
                A focused collection of practical guides and tools designed to
                help you understand faster, act with confidence, and make
                meaningful progress.
              </p>

              <Link to="/resources" className="featured-view-all">
                <span>Browse the complete library</span>

                <span className="featured-view-all-icon" aria-hidden="true">
                  <FiArrowUpRight />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="featured-grid">
          {featuredGuides.map((guide, index) => (
            <article
              className={`featured-card ${
                index === 0 ? "featured-card-primary" : ""
              }`}
              key={guide.id}
            >
              <div className="featured-image-box">
                <Link
                  to={`/product/${guide.slug}`}
                  className="featured-image-link"
                  aria-label={`View ${guide.title}`}
                >
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="featured-main-image"
                  />

                  {guide.hoverImage && (
                    <img
                      src={guide.hoverImage}
                      alt=""
                      aria-hidden="true"
                      className="featured-hover-image"
                    />
                  )}
                </Link>

                {guide.badge && (
                  <span className="featured-badge">{guide.badge}</span>
                )}

                <div className="featured-image-actions" aria-label="Resource actions">
                  <Link
                    to={`/product/${guide.slug}`}
                    className="featured-image-action"
                    aria-label={`Preview ${guide.title}`}
                  >
                    <FiEye aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    className="featured-image-action"
                    aria-label={`Save ${guide.title}`}
                  >
                    <FiHeart aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="featured-image-action"
                    aria-label={`Compare ${guide.title}`}
                  >
                    <FiBarChart2 aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="featured-content">
                <div className="featured-card-topline">
                  <span className="featured-category">
                    {guide.category}
                    {guide.type ? ` / ${guide.type}` : ""}
                  </span>

                  <span className="featured-card-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3>
                  <Link to={`/product/${guide.slug}`}>{guide.title}</Link>
                </h3>

                {guide.author && (
                  <p className="featured-author">By {guide.author}</p>
                )}

                <div className="featured-meta-row">
                  <RatingStars rating={guide.rating} />

                  {guide.rating && (
                    <span className="featured-rating-number">
                      {Number(guide.rating).toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="featured-purchase-row">
                  <div className="featured-price-row">
                    <span className="featured-price">KSh {guide.price}</span>

                    {guide.oldPrice && (
                      <span className="featured-old-price">
                        KSh {guide.oldPrice}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="featured-add-button"
                    onClick={() => addToBasket(guide)}
                  >
                    <FiShoppingBag aria-hidden="true" />
                    <span>Add to basket</span>
                  </button>
                </div>

                <Link
                  to={`/product/${guide.slug}`}
                  className="featured-details-link"
                >
                  <span>View resource details</span>
                  <FiArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedGuides;