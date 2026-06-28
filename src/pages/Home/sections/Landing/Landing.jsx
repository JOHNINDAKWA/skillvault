import { Link } from "react-router-dom";
import desktopImage from "../../../../assets/images/home-banner.png";
import mobileImage from "../../../../assets/images/bg-banner.png";
import "./Landing.css";

function Landing() {
  return (
    <section className="landing-section">
      <picture>
        <source media="(max-width: 900px)" srcSet={mobileImage} />
        <img
          src={desktopImage}
          alt="Digital guides, templates, and learning resources"
          className="landing-bg-image"
        />
      </picture>

      <div className="landing-soft-overlay" />

      <div className="container landing-container">
        <div className="landing-content">
          <span className="landing-small-title">Digital Knowledge Marketplace</span>

          <h1>
            Learn practical skills. Build your career. Grow your income.
          </h1>

          <p>
            Affordable guides, templates, checklists, and resources for people who
            want to learn faster, work smarter, and take action.
          </p>

          <div className="landing-actions">
            <Link to="/resources" className="landing-btn landing-btn-primary">
              Browse Resources
            </Link>

            <Link to="/about" className="landing-btn landing-btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Landing;