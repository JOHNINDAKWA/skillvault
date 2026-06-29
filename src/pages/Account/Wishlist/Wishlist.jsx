import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiEye,
  FiHeart,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";

import { resources } from "../../../data/resources.js";
import { useResources } from "../../../hooks/useResources.js";
import "./Wishlist.css";

const wishlistItems = resources.slice(2, 8).map((resource, index) => ({
  ...resource,
  savedDate: [
    "26 Jun 2026",
    "22 Jun 2026",
    "18 Jun 2026",
    "13 Jun 2026",
    "08 Jun 2026",
    "01 Jun 2026",
  ][index],
  reason: [
    "Useful for interview preparation",
    "Good for planning personal finances",
    "Saved for business ideas research",
    "Interesting digital skill resource",
    "May be useful for a future project",
    "Saved to review before purchase",
  ][index],
}));

function Wishlist() {
  const { addToBasket } = useResources();

  return (
    <section className="wishlist-page">
      <div className="wishlist-hero">
        <div>
          <span>Wishlist</span>

          <h1>Saved resources for later</h1>

          <p>
            Keep track of guides, templates, planners, and playbooks you are
            interested in before buying.
          </p>
        </div>

        <Link to="/resources">
          Browse Resources
          <FiArrowRight />
        </Link>
      </div>

      <div className="wishlist-summary-row">
        <div className="wishlist-summary-card">
          <FiHeart />

          <div>
            <span>{wishlistItems.length}</span>
            <p>Saved resources</p>
          </div>
        </div>

        <div className="wishlist-summary-card">
          <FiShoppingCart />

          <div>
            <span>
              KSh{" "}
              {wishlistItems.reduce((total, item) => total + item.price, 0)}
            </span>
            <p>Total wishlist value</p>
          </div>
        </div>

        <div className="wishlist-summary-card">
          <FiEye />

          <div>
            <span>Review</span>
            <p>Open details before checkout</p>
          </div>
        </div>
      </div>

      <div className="wishlist-section">
        <div className="wishlist-section-heading">
          <div>
            <span>Your Saved Picks</span>
            <h2>Resources you may want to buy</h2>
          </div>

          <p>{wishlistItems.length} items saved</p>
        </div>

        <div className="wishlist-list">
          {wishlistItems.map((item) => (
            <article className="wishlist-item" key={item.id}>
              <Link to={`/product/${item.slug}`} className="wishlist-image">
                <img src={item.image} alt={item.title} />
              </Link>

              <div className="wishlist-content">
                <span className="wishlist-category">
                  {item.category} / {item.type}
                </span>

                <h3>
                  <Link to={`/product/${item.slug}`}>{item.title}</Link>
                </h3>

                <p>{item.description}</p>

                <div className="wishlist-meta">
                  <span>Saved: {item.savedDate}</span>
                  <em>{item.reason}</em>
                </div>
              </div>

              <div className="wishlist-price-block">
                <span>KSh {item.price}</span>
                <del>KSh {item.oldPrice}</del>
              </div>

              <div className="wishlist-actions">
                <Link to={`/product/${item.slug}`}>
                  <FiEye />
                  View
                </Link>

                <button type="button" onClick={() => addToBasket(item)}>
                  <FiShoppingCart />
                  Add To Basket
                </button>

                <button type="button" className="wishlist-remove-btn">
                  <FiTrash2 />
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="wishlist-bottom-cta">
        <div>
          <span>Still exploring?</span>

          <h2>Find more practical resources</h2>

          <p>
            Browse more SkillVault guides and save the ones you may want to buy
            later.
          </p>
        </div>

        <Link to="/resources">
          Explore Resources
          <FiArrowRight />
        </Link>
      </div>
    </section>
  );
}

export default Wishlist;