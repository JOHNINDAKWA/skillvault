import { Link } from "react-router-dom";
import bgBanner from "../../../../assets/images/bg-banner.png";
import "./PromoBanner.css";

function PromoBanner() {
  return (
    <section
      className="promo-banner-section"
      style={{
        backgroundImage: `url(${bgBanner})`,
      }}
    >
      <div className="promo-banner-overlay" />


      <div className="container promo-banner-container">
        <div className="promo-banner-content">
          <span className="promo-banner-kicker">Limited Time Learning Picks</span>

          <h2>
            Build Skills
            <br />
            That Pay Off
          </h2>

          <p>
            Discover practical guides, templates, and checklists made for career
            growth, business ideas, money planning, and everyday productivity.
          </p>

          <Link to="/resources" className="promo-banner-btn">
            Explore Resources
          </Link>
        </div>
      </div>

    </section>
  );
}

export default PromoBanner;