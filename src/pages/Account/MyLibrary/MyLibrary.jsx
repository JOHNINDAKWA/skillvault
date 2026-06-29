import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiSearch,
} from "react-icons/fi";

import { resources } from "../../../data/resources.js";
import "./MyLibrary.css";

const libraryItems = resources.slice(0, 8).map((resource, index) => ({
  ...resource,
  progress: [72, 38, 100, 15, 0, 64, 100, 22][index],
  purchaseDate: [
    "24 Jun 2026",
    "21 Jun 2026",
    "18 Jun 2026",
    "14 Jun 2026",
    "09 Jun 2026",
    "02 Jun 2026",
    "28 May 2026",
    "19 May 2026",
  ][index],
  canDownload: [true, true, false, true, true, false, true, true][index],
  status: ["In Progress", "In Progress", "Completed", "In Progress", "Not Started", "In Progress", "Completed", "In Progress"][index],
}));

function MyLibrary() {
  const continueReading = libraryItems.filter(
    (item) => item.progress > 0 && item.progress < 100
  );

  return (
    <section className="library-page">
      <div className="library-hero">
        <div>
          <span>My Library</span>

          <h1>Your purchased resources</h1>

          <p>
            Read your SkillVault guides online, continue where you stopped, and
            download files where access is allowed.
          </p>
        </div>

        <Link to="/resources">
          Explore More
          <FiArrowRight />
        </Link>
      </div>

      <div className="library-toolbar">
        <label className="library-search">
          <FiSearch />

          <input type="search" placeholder="Search your library..." />
        </label>

        <div className="library-filter-tabs">
          <button type="button" className="is-active">
            All
          </button>

          <button type="button">In Progress</button>

          <button type="button">Completed</button>

          <button type="button">Downloads</button>
        </div>
      </div>

      {continueReading.length > 0 && (
        <div className="library-section">
          <div className="library-section-heading">
            <div>
              <span>Continue Reading</span>
              <h2>Pick up from your latest resources</h2>
            </div>
          </div>

          <div className="continue-reading-strip">
            {continueReading.slice(0, 3).map((item) => (
              <article className="continue-library-card" key={item.id}>
                <Link
                  to={`/account/reader/${item.slug}`}
                  className="continue-library-image"
                >
                  <img src={item.image} alt={item.title} />
                </Link>

                <div className="continue-library-content">
                  <span>
                    {item.category} / {item.type}
                  </span>

                  <h3>
                    <Link to={`/account/reader/${item.slug}`}>{item.title}</Link>
                  </h3>

                  <div className="library-progress">
                    <span style={{ width: `${item.progress}%` }} />
                  </div>

                  <div className="continue-library-bottom">
                    <p>{item.progress}% complete</p>

                    <Link to={`/account/reader/${item.slug}`}>
                      Continue
                      <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="library-section">
        <div className="library-section-heading">
          <div>
            <span>All Resources</span>
            <h2>Your full SkillVault collection</h2>
          </div>

          <p>{libraryItems.length} resources available</p>
        </div>

        <div className="library-grid">
          {libraryItems.map((item) => (
            <article className="library-card" key={item.id}>
              <div className="library-card-image">
                <Link to={`/account/reader/${item.slug}`}>
                  <img src={item.image} alt={item.title} />
                </Link>

                <div className="library-card-badge">
                  {item.status === "Completed" && <FiCheckCircle />}
                  {item.status === "In Progress" && <FiClock />}
                  {item.status === "Not Started" && <FiBookOpen />}
                  {item.status}
                </div>
              </div>

              <div className="library-card-content">
                <span className="library-card-category">
                  {item.category} / {item.type}
                </span>

                <h3>
                  <Link to={`/account/reader/${item.slug}`}>{item.title}</Link>
                </h3>

                <p>{item.description}</p>

                <div className="library-card-meta">
                  <span>Purchased: {item.purchaseDate}</span>
                  <strong>{item.progress}%</strong>
                </div>

                <div className="library-progress">
                  <span style={{ width: `${item.progress}%` }} />
                </div>

                <div className="library-card-actions">
                  <Link to={`/account/reader/${item.slug}`}>
                    <FiEye />
                    Read Online
                  </Link>

                  {item.canDownload ? (
                    <button type="button">
                      <FiDownload />
                      Download
                    </button>
                  ) : (
                    <button type="button" disabled>
                      Online Only
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MyLibrary;