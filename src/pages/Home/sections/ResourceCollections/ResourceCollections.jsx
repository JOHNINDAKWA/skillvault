import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiImage,
  FiLayers,
} from "react-icons/fi";

import collection1 from "../../../../assets/images/collection1.png";
import collection2 from "../../../../assets/images/collection2.png";
import collection3 from "../../../../assets/images/collection3.png";
import collection4 from "../../../../assets/images/collection4.png";
import collection5 from "../../../../assets/images/collection5.png";

import { useResources } from "../../../../hooks/useResources.js";

import "./ResourceCollections.css";

const collectionPresentation = [
  {
    category: "Career",
    title: "Career Growth",
    subtitle: "CVs, interviews, salary talks, and workplace growth.",
    image: collection1,
  },
  {
    category: "Business",
    title: "Business Builder",
    subtitle: "Side hustles, business ideas, and selling online.",
    image: collection2,
  },
  {
    category: "Money",
    title: "Money & Budgeting",
    subtitle: "Savings, debt control, budgets, and trackers.",
    image: collection3,
  },
  {
    category: "AI",
    title: "AI & Productivity",
    subtitle: "Prompts, workflows, automation, and digital tools.",
    image: collection4,
  },
  {
    category: "Templates",
    title: "Templates & Planners",
    subtitle: "Documents, checklists, and planning tools.",
    image: collection5,
  },
];

function ResourceCollections() {
  const { resources, isLoadingResources } = useResources();

  const collections = useMemo(() => {
    return collectionPresentation
      .map((presentation) => {
        const matchingResources = resources.filter(
          (resource) => resource.category === presentation.category
        );

        if (matchingResources.length === 0) {
          return null;
        }

        const uploadedCover = matchingResources.find((resource) =>
          Boolean(resource.image)
        )?.image;

        return {
          ...presentation,
          image: uploadedCover || presentation.image,
          count: matchingResources.length,
          path: `/resources?category=${encodeURIComponent(
            presentation.category
          )}`,
        };
      })
      .filter(Boolean)
      .slice(0, 4);
  }, [resources]);

  return (
    <section
      className="svc-collections"
      aria-labelledby="svc-collections-title"
    >
      <div className="container svc-collections-container">
        <div className="svc-collections-header">
          <h2 id="svc-collections-title">Browse collections</h2>

          <Link to="/resources" className="svc-collections-view-all">
            <span>View all resources</span>
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        {isLoadingResources && collections.length === 0 && (
          <div className="svc-collections-state" role="status">
            <span className="svc-collections-spinner" aria-hidden="true" />
            <span>Loading curated collections...</span>
          </div>
        )}

        {!isLoadingResources && collections.length === 0 && (
          <div className="svc-collections-state svc-collections-empty">
            <span className="svc-collections-empty-icon" aria-hidden="true">
              <FiImage />
            </span>

            <h3>Collections are being prepared</h3>

            <p>
              Curated collections will appear as published resources are added.
            </p>
          </div>
        )}

        {collections.length > 0 && (
          <div className="svc-collections-list">
            {collections.map((collection) => (
              <Link
                to={collection.path}
                className="svc-collection-card"
                key={collection.category}
              >
                <div className="svc-collection-image">
                  <img src={collection.image} alt={collection.title} />

                  <span className="svc-collection-count">
                    <FiLayers aria-hidden="true" />
                    {collection.count}
                  </span>
                </div>

                <div className="svc-collection-body">
                  <span className="svc-collection-category">
                    {collection.category}
                  </span>

                  <h3>{collection.title}</h3>

                  <p>{collection.subtitle}</p>

                  <span className="svc-collection-action">
                    <span>Open collection</span>
                    <FiArrowUpRight aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ResourceCollections;