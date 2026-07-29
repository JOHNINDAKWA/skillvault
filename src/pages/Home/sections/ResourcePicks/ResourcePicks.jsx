import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiEye,
  FiHeart,
  FiShoppingBag,
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

  const resourcePicks = useMemo(() => {
    const preferredResources = resourcePickSlugs
      .map((slug) => resources.find((resource) => resource.slug === slug))
      .filter(Boolean);

    if (preferredResources.length >= 6) {
      return preferredResources.slice(0, 6);
    }

    const preferredIds = new Set(
      preferredResources.map((resource) => resource.id)
    );

    const fallbackResources = resources.filter(
      (resource) =>
        resource?.id &&
        resource?.slug &&
        resource?.image &&
        !preferredIds.has(resource.id)
    );

    return [...preferredResources, ...fallbackResources].slice(0, 6);
  }, [resources]);

  return (
    <section
      className="resource-picks-section"
      aria-labelledby="resource-picks-title"
    >
      <div className="container">
        <div className="resource-picks-intro">
          <div className="resource-picks-title-block">
            <span className="resource-picks-kicker">
              Curated resource packs
            </span>

            <h2 id="resource-picks-title">
              Recommended practical collections built for action.
            </h2>
          </div>

          <div className="resource-picks-intro-copy">
            <p>
              Each pack brings together useful guides, templates, checklists,
              and planning tools around one clear goal.
            </p>

            <Link to="/resources" className="resource-picks-library-link">
              <span>Browse the full library</span>

              <span className="resource-picks-library-icon" aria-hidden="true">
                <FiArrowUpRight />
              </span>
            </Link>
          </div>
        </div>

        <div className="resource-picks-grid">
          {resourcePicks.map((item, index) => (
            <article className="resource-pick-card" key={item.id}>
              <div className="resource-pick-image-wrap">
                <Link
                  to={`/product/${item.slug}`}
                  className="resource-pick-image-link"
                  aria-label={`View ${item.title}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="resource-pick-main-image"
                  />

                  {item.hoverImage && (
                    <img
                      src={item.hoverImage}
                      alt=""
                      aria-hidden="true"
                      className="resource-pick-hover-image"
                    />
                  )}
                </Link>

                {item.badge && (
                  <span className="resource-pick-tag">{item.badge}</span>
                )}

                <span className="resource-pick-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div
                  className="resource-pick-icons"
                  aria-label="Resource actions"
                >
                  <Link
                    to={`/product/${item.slug}`}
                    aria-label={`Preview ${item.title}`}
                  >
                    <FiEye aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    aria-label={`Save ${item.title}`}
                  >
                    <FiHeart aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="resource-pick-content">
                <span className="resource-pick-category">
                  {item.category}
                  {item.type ? ` / ${item.type}` : ""}
                </span>

                <h3>
                  <Link to={`/product/${item.slug}`}>{item.title}</Link>
                </h3>

                {item.description && (
                  <p className="resource-pick-description">
                    {item.description}
                  </p>
                )}

                <div className="resource-pick-price-row">
                  <span className="resource-pick-price">
                    KSh {item.price}
                  </span>

                  {item.oldPrice && (
                    <span className="resource-pick-old-price">
                      KSh {item.oldPrice}
                    </span>
                  )}
                </div>

                <div className="resource-pick-actions">
                  <Link
                    to={`/product/${item.slug}`}
                    className="resource-pick-details-link"
                  >
                    <span>View details</span>
                    <FiArrowUpRight aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    className="resource-pick-basket-btn"
                    onClick={() => addToBasket(item)}
                  >
                    <FiShoppingBag aria-hidden="true" />
                    <span>Add to basket</span>
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

export default ResourcePicks;