import { Link } from "react-router-dom";
import { FiArrowUpRight, FiBookOpen } from "react-icons/fi";

import landingImage from "../../../../assets/images/home-banner.png";

import "./Landing.css";

const resourceTypes = [
  "Guides",
  "Templates",
  "Checklists",
  "Workbooks",
];

function Landing() {
  return (
    <section className="landing-section" aria-labelledby="landing-title">
      <div className="container landing-container">
        <div className="landing-content">
          <span className="landing-eyebrow">
            SkillVault Digital Library
          </span>

          <h1 id="landing-title">
            Practical resources for better work, stronger careers, and smarter
            decisions.
          </h1>

          <p className="landing-description">
            Access carefully developed guides, templates, and learning tools
            created to help you solve real problems, develop useful skills, and
            make meaningful progress.
          </p>

          <div className="landing-actions">
            <Link
              to="/resources"
              className="landing-btn landing-btn-primary"
            >
              Explore Resources
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

          <div className="landing-resource-types" aria-label="Resource types">
            {resourceTypes.map((type) => (
              <span key={type}>{type}</span>
            ))}
          </div>
        </div>

        <figure className="landing-visual">
          <div className="landing-image-frame">
            <img
              src={landingImage}
              alt="A modern digital learning workspace with guides, templates, and productivity resources"
              className="landing-main-image"
            />
          </div>

          <figcaption className="landing-caption">
            <div>
              <span className="landing-caption-label">
                Knowledge designed for action
              </span>

              <p>
                Clear, focused resources for professionals, entrepreneurs,
                students, and ambitious learners.
              </p>
            </div>

            <Link to="/resources" className="landing-caption-link">
              View the library
              <FiArrowUpRight aria-hidden="true" />
            </Link>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export default Landing;