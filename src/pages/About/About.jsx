import {
  Link,
} from "react-router-dom";

import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiShield,
  FiTarget,
  FiUsers,
} from "react-icons/fi";

import "./About.css";

const values = [
  {
    icon: FiTarget,
    title: "Useful",
    description:
      "Resources created to help people take action.",
  },
  {
    icon: FiShield,
    title: "Trusted",
    description:
      "Clear information, fair pricing, and dependable access.",
  },
  {
    icon: FiUsers,
    title: "Accessible",
    description:
      "Practical learning for real people and real goals.",
  },
];

const steps = [
  {
    number: "01",
    title: "Find",
    description:
      "Browse guides, templates, planners, and playbooks.",
  },
  {
    number: "02",
    title: "Buy",
    description:
      "Complete checkout using the available payment options.",
  },
  {
    number: "03",
    title: "Use",
    description:
      "Read online or download supported files from your library.",
  },
];

const audiences = [
  {
    label: "Job seekers",
    className: "is-cream",
  },
  {
    label: "Professionals",
    className: "is-blue",
  },
  {
    label: "Entrepreneurs",
    className: "is-green",
  },
  {
    label: "Students",
    className: "is-lilac",
  },
  {
    label: "Business owners",
    className: "is-peach",
  },
  {
    label: "Lifelong learners",
    className: "is-yellow",
  },
];

function About() {
  return (
    <main className="about-v4-page">
      <section className="about-v4-white-section about-v4-hero-section">
        <div className="about-v4-container about-v4-hero">
          <div className="about-v4-hero-copy">
            <span>About SkillVault</span>

            <h1>
              Practical knowledge for everyday progress
            </h1>

            <p>
              SkillVault makes useful digital resources easier to find,
              purchase, and use.
            </p>

            <div className="about-v4-hero-actions">
              <Link
                to="/resources"
                className="about-v4-primary-action"
              >
                Explore resources
                <FiArrowRight aria-hidden="true" />
              </Link>

              <Link
                to="/contact"
                className="about-v4-secondary-action"
              >
                Contact us
              </Link>
            </div>
          </div>

          <div className="about-v4-hero-image">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=90"
              alt="People learning and working together"
            />

            <div className="about-v4-image-note">
              <FiBookOpen aria-hidden="true" />

              <div>
                <strong>
                  Built for practical learning
                </strong>

                <span>
                  Clear resources you can use immediately.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-v4-white-section">
        <div className="about-v4-container about-v4-purpose">
          <div className="about-v4-purpose-image">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=90"
              alt="Laptop and notebook used for online learning"
            />
          </div>

          <div className="about-v4-purpose-copy">
            <span>Our purpose</span>

            <h2>
              Resources that help people move forward
            </h2>

            <p>
              From career growth to business planning and personal
              development, every resource should solve a clear problem.
            </p>

            <div className="about-v4-purpose-list">
              <div>
                <FiCheckCircle aria-hidden="true" />
                <span>Simple access after purchase</span>
              </div>

              <div>
                <FiCheckCircle aria-hidden="true" />
                <span>Affordable practical resources</span>
              </div>

              <div>
                <FiCheckCircle aria-hidden="true" />
                <span>An organised personal library</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-v4-white-section">
        <div className="about-v4-container about-v4-values">
          <div className="about-v4-section-heading about-v4-section-heading-centered">
            <span>What guides us</span>

            <h2>
              Simple principles
            </h2>
          </div>

          <div className="about-v4-values-grid">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article key={value.title}>
                  <span>
                    <Icon aria-hidden="true" />
                  </span>

                  <h3>{value.title}</h3>

                  <p>{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-v4-how">
        <div className="about-v4-how-overlay" />

        <div className="about-v4-container about-v4-how-content">
          <div className="about-v4-how-copy">
            <span>How it works</span>

            <h2>
              From discovery to your library
            </h2>

            <p>
              Find what you need, complete your purchase, and keep it
              organised in your account.
            </p>

            <Link to="/resources">
              Start exploring
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className="about-v4-steps">
            {steps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>

                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-v4-white-section">
        <div className="about-v4-container about-v4-audience">
          <div>
            <span>Who it is for</span>

            <h2>
              Made for people building better futures
            </h2>

            <p>
              SkillVault supports people looking for practical resources
              that help them learn, work, and grow.
            </p>
          </div>

          <div className="about-v4-audience-tags">
            {audiences.map((audience) => (
              <span
                key={audience.label}
                className={audience.className}
              >
                {audience.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="about-v4-white-section">
        <div className="about-v4-container about-v4-cta">
          <div>
            <small>Ready to begin?</small>

            <h2>
              Find a resource for your next step
            </h2>
          </div>

          <Link to="/resources">
            Browse the library
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default About;
