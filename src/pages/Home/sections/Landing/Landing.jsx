import { Link } from "react-router-dom";
import { FiArrowUpRight, FiBookOpen } from "react-icons/fi";

import landingImage from "../../../../assets/images/home-banner.png";

import "./Landing.css";

function Landing() {
  return (
    <section
      className="landing-section"
      aria-labelledby="landing-title"
    >
      <div className="container landing-container">
        <div className="landing-content">
          <span className="landing-eyebrow">
            SkillVault Digital Library
          </span>

          <h1 id="landing-title">
            Practical tools for work and growth.
          </h1>

          <p className="landing-description">
            Explore guides, templates, and workbooks designed to help
            you learn faster and get things done.
          </p>

          <div className="landing-actions">
            <Link
              to="/resources"
              className="landing-btn landing-btn-primary"
            >
              Browse Resources
              <FiArrowUpRight aria-hidden="true" />
            </Link>

            <Link
              to="/about"
              className="landing-btn landing-btn-secondary"
            >
              <FiBookOpen aria-hidden="true" />
              About SkillVault
            </Link>
          </div>
        </div>

        <figure className="landing-visual">
          <div className="landing-image-frame">
            <img
              src={landingImage}
              alt="Digital learning resources and productivity tools"
              className="landing-main-image"
            />
          </div>

          <figcaption className="landing-caption">
            <span>Guides. Templates. Practical learning.</span>

            <Link to="/resources">
              Explore Library
              <FiArrowUpRight aria-hidden="true" />
            </Link>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export default Landing;