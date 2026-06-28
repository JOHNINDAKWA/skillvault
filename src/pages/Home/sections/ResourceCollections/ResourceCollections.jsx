import { Link } from "react-router-dom";

import collection1 from "../../../../assets/images/collection1.png";
import collection2 from "../../../../assets/images/collection2.png";
import collection3 from "../../../../assets/images/collection3.png";
import collection4 from "../../../../assets/images/collection4.png";
import collection5 from "../../../../assets/images/collection5.png";

import "./ResourceCollections.css";

const collections = [
  {
    title: "Career Growth Collection",
    subtitle: "CVs, interviews, salary talks, and workplace growth.",
    image: collection1,
    path: "/resources?category=Career",
    layout: "large",
  },
  {
    title: "Business Builder Collection",
    subtitle: "Side hustles, small business ideas, and selling online.",
    image: collection2,
    path: "/resources?category=Business",
  },
  {
    title: "Money & Budgeting Collection",
    subtitle: "Savings, debt control, budgets, and simple trackers.",
    image: collection3,
    path: "/resources?category=Money",
  },
  {
    title: "AI & Productivity Collection",
    subtitle: "Prompts, workflows, automation ideas, and digital tools.",
    image: collection4,
    path: "/resources?category=AI",
  },
  {
    title: "Templates & Planners Collection",
    subtitle: "Ready-to-use documents, checklists, and planning tools.",
    image: collection5,
    path: "/resources?category=Templates",
  },
];

function ResourceCollections() {
  return (
    <section className="resource-collections-section">
      <div className="container">
        <div className="resource-collections-heading">
          <span>Browse By Collection</span>

          <h2>
            Find The Right Resources
            <br />
            For What You Are Building
          </h2>
        </div>

        <div className="resource-collections-grid">
          {collections.map((collection) => (
            <Link
              to={collection.path}
              className={`resource-collection-card ${
                collection.layout === "large" ? "is-large" : ""
              }`}
              key={collection.title}
            >
              <img src={collection.image} alt={collection.title} />

              <div className="resource-collection-label">
                <h3>{collection.title}</h3>
                <p>{collection.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ResourceCollections;