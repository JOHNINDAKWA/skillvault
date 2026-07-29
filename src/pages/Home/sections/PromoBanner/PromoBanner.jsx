import { Link } from "react-router-dom";
import { FiArrowUpRight, FiBookOpen } from "react-icons/fi";

import bgBanner from "../../../../assets/images/bg-banner.png";

import "./PromoBanner.css";

const focusAreas = [
  "Career growth",
  "Business",
  "Money planning",
  "Productivity",
];

function PromoBanner() {
  return (
    <section
      className="promo-banner-section"
      aria-labelledby="promo-banner-title"
      style={{
        backgroundImage: `url(${bgBanner})`,
      }}
    >
      <div className="promo-banner-overlay" aria-hidden="true" />

      <div className="container promo-banner-container">
        <div className="promo-banner-content">
          <span className="promo-banner-kicker">
            A focused place to begin
          </span>

          <h2 id="promo-banner-title">
            Build skills that stay useful beyond the moment.
          </h2>

          <p>
            Explore practical guides, templates, and checklists designed to help
            you take clearer action in your career, business, finances, and
            everyday work.
          </p>

          <div
            className="promo-banner-focus"
            aria-label="Featured learning areas"
          >
            {focusAreas.map((area) => (
              <span key={area}>{area}</span>
            ))}
          </div>

          <Link to="/resources" className="promo-banner-btn">
            <span>Explore the resource library</span>
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        <aside className="promo-banner-note">
          <FiBookOpen aria-hidden="true" />

          <div>
            <span>Practical learning</span>

            <p>
              Resources created for real decisions, real projects, and
              meaningful progress.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default PromoBanner;