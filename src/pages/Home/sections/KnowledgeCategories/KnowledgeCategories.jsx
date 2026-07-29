import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
} from "react-icons/fi";

import book1 from "../../../../assets/images/book1.png";
import book2 from "../../../../assets/images/book2.png";
import book3 from "../../../../assets/images/book3.png";
import book4 from "../../../../assets/images/book4.png";
import book5 from "../../../../assets/images/book5.png";
import book6 from "../../../../assets/images/book6.png";
import book7 from "../../../../assets/images/book7.png";

import { useResources } from "../../../../hooks/useResources.js";

import "./KnowledgeCategories.css";
import "./KnowledgeCategoriesConnected.css";

const categoryPresentation = {
  Career: {
    title: "Career Playbooks",
    image: book1,
  },
  Business: {
    title: "Business Toolkits",
    image: book2,
  },
  Money: {
    title: "Money Resources",
    image: book3,
  },
  Technology: {
    title: "Tech Skills",
    image: book4,
  },
  Education: {
    title: "Student Success",
    image: book5,
  },
  Templates: {
    title: "Templates & Planners",
    image: book6,
  },
  AI: {
    title: "AI Productivity",
    image: book7,
  },
};

function getItemsPerView() {
  if (window.innerWidth <= 480) {
    return 1;
  }

  if (window.innerWidth <= 900) {
    return 2;
  }

  return 4;
}

function KnowledgeCategories() {
  const { resources, isLoadingResources } = useResources();

  const [activeIndex, setActiveIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(getItemsPerView);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const categories = useMemo(() => {
    const groupedResources = new Map();

    for (const resource of resources) {
      if (!resource.category) {
        continue;
      }

      const existing = groupedResources.get(resource.category) || [];
      existing.push(resource);
      groupedResources.set(resource.category, existing);
    }

    return [...groupedResources.entries()]
      .map(([category, items]) => {
        const presentation = categoryPresentation[category] || {
          title: `${category} Resources`,
          image: book4,
        };

        const uploadedCover = items.find((item) => Boolean(item.image))?.image;

        return {
          category,
          title: presentation.title,
          image: uploadedCover || presentation.image,
          count: items.length,
          path: `/resources?category=${encodeURIComponent(category)}`,
        };
      })
      .sort((first, second) => first.title.localeCompare(second.title));
  }, [resources]);

  const hasOverflow = categories.length > itemsPerView;

  const carouselItems = useMemo(() => {
    if (!hasOverflow) {
      return categories;
    }

    return [...categories, ...categories];
  }, [categories, hasOverflow]);

  const visibleSlide =
    categories.length > 0 ? (activeIndex % categories.length) + 1 : 0;

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(getItemsPerView());
    };

    window.addEventListener("resize", updateItemsPerView);

    return () => {
      window.removeEventListener("resize", updateItemsPerView);
    };
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    setTransitionEnabled(true);
  }, [categories.length, itemsPerView]);

  useEffect(() => {
    if (!hasOverflow || categories.length === 0) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setTransitionEnabled(true);
      setActiveIndex((current) => current + 1);
    }, 4200);

    return () => {
      window.clearInterval(interval);
    };
  }, [hasOverflow, categories.length]);

  useEffect(() => {
    if (!hasOverflow || activeIndex !== categories.length) {
      return undefined;
    }

    const resetTimer = window.setTimeout(() => {
      setTransitionEnabled(false);
      setActiveIndex(0);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTransitionEnabled(true);
        });
      });
    }, 760);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [activeIndex, categories.length, hasOverflow]);

  const nextSlide = () => {
    if (!hasOverflow) {
      return;
    }

    setTransitionEnabled(true);
    setActiveIndex((current) => current + 1);
  };

  const previousSlide = () => {
    if (!hasOverflow) {
      return;
    }

    if (activeIndex === 0) {
      setTransitionEnabled(false);
      setActiveIndex(categories.length);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTransitionEnabled(true);
          setActiveIndex(categories.length - 1);
        });
      });

      return;
    }

    setTransitionEnabled(true);
    setActiveIndex((current) => current - 1);
  };

  return (
    <section
      className="knowledge-categories-section"
      aria-labelledby="knowledge-categories-title"
    >
      <div className="container">
        <div className="knowledge-intro">
          <div className="knowledge-intro-title">
            <span className="knowledge-eyebrow">Curated by purpose</span>

            <h2 id="knowledge-categories-title">
              Choose the direction you want to grow in next.
            </h2>
          </div>

          <div className="knowledge-intro-note">
            <p>
              Browse practical collections built around real skills, useful
              tools, and knowledge you can apply immediately.
            </p>

            <Link to="/resources" className="knowledge-view-all">
              <span>Open the full library</span>

              <span className="knowledge-view-all-icon" aria-hidden="true">
                <FiArrowUpRight />
              </span>
            </Link>
          </div>
        </div>

        {isLoadingResources && categories.length === 0 && (
          <div className="knowledge-categories-loading" role="status">
            <span className="home-catalogue-spinner" aria-hidden="true" />
            <span>Loading resource categories...</span>
          </div>
        )}

        {!isLoadingResources && categories.length === 0 && (
          <div className="knowledge-categories-empty">
            <span className="knowledge-empty-icon" aria-hidden="true">
              <FiImage />
            </span>

            <h3>Categories are being prepared</h3>

            <p>
              Published resource categories will appear here automatically.
            </p>
          </div>
        )}

        {categories.length > 0 && (
          <div className="knowledge-slider">
            <div className="knowledge-window">
              <div
                className={`knowledge-track ${
                  transitionEnabled ? "" : "no-transition"
                }`}
                style={{
                  transform: hasOverflow
                    ? `translateX(calc(-${activeIndex} * ((100% - (var(--knowledge-gap) * (${itemsPerView} - 1))) / ${itemsPerView} + var(--knowledge-gap))))`
                    : "translateX(0)",
                }}
              >
                {carouselItems.map((item, index) => (
                  <Link
                    to={item.path}
                    className="knowledge-item"
                    key={`${item.category}-${index}`}
                    style={{
                      flexBasis: `calc((100% - (var(--knowledge-gap) * (${itemsPerView} - 1))) / ${itemsPerView})`,
                    }}
                  >
                    <div className="knowledge-image">
                      <img src={item.image} alt={item.title} />

                      <span className="knowledge-resource-count">
                        {item.count} resource{item.count === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="knowledge-item-content">
                      <span className="knowledge-item-category">
                        {item.category}
                      </span>

                      <h3>{item.title}</h3>

                      <span className="knowledge-item-link">
                        <span>Explore collection</span>

                        <span
                          className="knowledge-item-link-icon"
                          aria-hidden="true"
                        >
                          <FiArrowUpRight />
                        </span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {hasOverflow && (
              <div className="knowledge-controls">
                <div className="knowledge-progress" aria-hidden="true">
                  <span className="knowledge-progress-current">
                    {String(visibleSlide).padStart(2, "0")}
                  </span>

                  <span className="knowledge-progress-line" />

                  <span className="knowledge-progress-total">
                    {String(categories.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="knowledge-arrow-group">
                  <button
                    type="button"
                    className="knowledge-arrow knowledge-arrow-left"
                    onClick={previousSlide}
                    aria-label="Previous category"
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    type="button"
                    className="knowledge-arrow knowledge-arrow-right"
                    onClick={nextSlide}
                    aria-label="Next category"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default KnowledgeCategories;