import { Link } from "react-router-dom";
import {
  FiEye,
  FiHeart,
  FiShoppingCart,
  FiBarChart2,
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
  return (
    <div className="featured-rating" aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }, (_, index) => (
        <FiStar
          key={index}
          className={index < rating ? "star-filled" : "star-muted"}
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
    <section className="featured-guides-section">
      <div className="container">
        <div className="featured-heading">
          <span>Fresh From SkillVault</span>

          <h2>
            Resources Built To Help You
            <br />
            <strong>Move Forward</strong>
          </h2>
        </div>

        <div className="featured-grid">
          {featuredGuides.map((guide) => (
            <article className="featured-card" key={guide.id}>
              <div className="featured-image-box">
                <Link
                  to={`/product/${guide.slug}`}
                  className="featured-image-link"
                >
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="featured-main-image"
                  />

                  <img
                    src={guide.hoverImage}
                    alt=""
                    aria-hidden="true"
                    className="featured-hover-image"
                  />
                </Link>

                <span className="featured-badge">{guide.badge}</span>

                <div className="featured-icons">
                  <button type="button" aria-label="Preview resource">
                    <FiEye />
                  </button>

                  <button type="button" aria-label="Save resource">
                    <FiHeart />
                  </button>

                  <button type="button" aria-label="Compare resource">
                    <FiBarChart2 />
                  </button>
                </div>
              </div>

              <div className="featured-content">
                <span className="featured-category">
                  {guide.category} / {guide.type}
                </span>

                <h3>
                  <Link to={`/product/${guide.slug}`}>{guide.title}</Link>
                </h3>

                {guide.author && <p>{guide.author}</p>}

                <RatingStars rating={guide.rating} />

                <div className="featured-price-row">
                  <span className="featured-price">KSh {guide.price}</span>
                  <span className="featured-old-price">
                    KSh {guide.oldPrice}
                  </span>
                </div>

                <div className="featured-actions">
                  <Link
                    to={`/product/${guide.slug}`}
                    className="featured-btn featured-btn-light"
                  >
                    View Details
                  </Link>

                  <button
                    type="button"
                    className="featured-btn featured-btn-red"
                    onClick={() => addToBasket(guide)}
                  >
                    <FiShoppingCart />
                    Add To Basket
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedGuides;