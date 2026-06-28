import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiShoppingBag,
  FiEye,
  FiHeart,
} from "react-icons/fi";

import { useResources } from "../../../../hooks/useResources.js";
import "./ResourcePicks.css";

const resourcePickSlugs = [
  "career-starter-kit",
  "side-hustle-launch-toolkit",
  "ai-productivity-starter-pack",
  "budget-savings-debt-reset-kit",
  "campus-survival-study-system",
  "ready-to-use-documents-bundle",
];

function ResourcePicks() {
  const { resources, addToBasket } = useResources();

  const resourcePicks = resourcePickSlugs
    .map((slug) => resources.find((resource) => resource.slug === slug))
    .filter(Boolean);

  return (
    <section className="resource-picks-section">
      <div className="container">
        <div className="resource-picks-heading">
          <span>Curated Resource Packs</span>

          <div className="resource-picks-heading-row">
            <h2>
              Start With A Pack Built
              <br />
              For Action
            </h2>

            <p>
              Not sure where to begin? These bundles combine practical guides,
              templates, checklists, and planners around one clear goal.
            </p>
          </div>
        </div>

        <div className="resource-picks-scroller">
          {resourcePicks.map((item) => (
            <article className="resource-pick-card" key={item.id}>
              <div className="resource-pick-image-wrap">
                <Link
                  to={`/product/${item.slug}`}
                  className="resource-pick-image-link"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="resource-pick-main-image"
                  />

                  <img
                    src={item.hoverImage}
                    alt=""
                    aria-hidden="true"
                    className="resource-pick-hover-image"
                  />
                </Link>

                <span className="resource-pick-tag">{item.badge}</span>

                <div className="resource-pick-icons">
                  <button type="button" aria-label="Preview resource">
                    <FiEye />
                  </button>

                  <button type="button" aria-label="Save resource">
                    <FiHeart />
                  </button>
                </div>
              </div>

              <div className="resource-pick-content">
                <h3>
                  <Link to={`/product/${item.slug}`}>{item.title}</Link>
                </h3>

                <p>{item.description}</p>

                <div className="resource-pick-bottom">
                  <span>KSh {item.price}</span>

                  <Link to={`/product/${item.slug}`}>
                    View Details
                    <FiArrowRight />
                  </Link>
                </div>

                <button
                  type="button"
                  className="resource-pick-basket-btn"
                  onClick={() => addToBasket(item)}
                >
                  <FiShoppingBag />
                  Add To Basket
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="resource-picks-footer">
          <Link to="/resources" className="resource-picks-main-btn">
            View All Resources
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ResourcePicks;