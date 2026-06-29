import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiDownload,
  FiTrendingUp,
} from "react-icons/fi";

import { FaReceipt } from "react-icons/fa6";


import { resources } from "../../../data/resources.js";
import "./AccountDashboard.css";

const purchasedResources = resources.slice(0, 4).map((resource, index) => ({
  ...resource,
  progress: [68, 34, 12, 0][index],
  purchaseDate: ["24 Jun 2026", "20 Jun 2026", "16 Jun 2026", "12 Jun 2026"][
    index
  ],
  canDownload: index !== 2,
}));

function AccountDashboard() {
  const continueReading = purchasedResources.filter(
    (item) => item.progress > 0 && item.progress < 100
  );

  return (
    <section className="account-dashboard">
      <div className="account-welcome">
        <div>
          <span>Welcome back</span>

          <h1>Your SkillVault Library</h1>

          <p>
            Access your purchased guides, continue reading, download allowed
            files, and keep track of your practical resources in one place.
          </p>
        </div>

        <Link to="/resources">
          Browse More Resources
          <FiArrowRight />
        </Link>
      </div>

      <div className="account-stats-grid">
        <div className="account-stat-card">
          <FiBookOpen />

          <div>
            <span>{purchasedResources.length}</span>
            <p>Purchased resources</p>
          </div>
        </div>

        <div className="account-stat-card">
          <FiClock />

          <div>
            <span>{continueReading.length}</span>
            <p>In progress</p>
          </div>
        </div>

        <div className="account-stat-card">
          <FiDownload />

          <div>
            <span>
              {purchasedResources.filter((item) => item.canDownload).length}
            </span>
            <p>Available downloads</p>
          </div>
        </div>

        <div className="account-stat-card">
          <FaReceipt />

          <div>
            <span>4</span>
            <p>Receipts</p>
          </div>
        </div>
      </div>

      <div className="account-dashboard-grid">
        <div className="account-panel account-library-panel">
          <div className="account-panel-heading">
            <div>
              <span>Continue Reading</span>
              <h2>Pick up where you stopped</h2>
            </div>

            <Link to="/account/library">View Library</Link>
          </div>

          <div className="continue-list">
            {continueReading.map((item) => (
              <article className="continue-card" key={item.id}>
                <Link to={`/account/reader/${item.slug}`} className="continue-image">
                  <img src={item.image} alt={item.title} />
                </Link>

                <div className="continue-content">
                  <span>
                    {item.category} / {item.type}
                  </span>

                  <h3>
                    <Link to={`/account/reader/${item.slug}`}>
                      {item.title}
                    </Link>
                  </h3>

                  <div className="progress-track">
                    <span style={{ width: `${item.progress}%` }} />
                  </div>

                  <div className="continue-bottom">
                    <p>{item.progress}% complete</p>

                    <Link to={`/account/reader/${item.slug}`}>
                      Read
                      <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="account-panel account-actions-panel">
          <div className="account-panel-heading">
            <div>
              <span>Quick Actions</span>
              <h2>What would you like to do?</h2>
            </div>
          </div>

          <div className="quick-actions-list">
            <Link to="/account/library">
              <FiBookOpen />
              <div>
                <strong>Open My Library</strong>
                <p>View all purchased guides and templates.</p>
              </div>
            </Link>

            <Link to="/account/downloads">
              <FiDownload />
              <div>
                <strong>Download Files</strong>
                <p>Access resources that allow downloads.</p>
              </div>
            </Link>

            <Link to="/account/receipts">
              <FaReceipt />
              <div>
                <strong>View Receipts</strong>
                <p>Check your order and payment history.</p>
              </div>
            </Link>

            <Link to="/resources">
              <FiTrendingUp />
              <div>
                <strong>Discover More</strong>
                <p>Find more guides, planners, and playbooks.</p>
              </div>
            </Link>
          </div>
        </aside>
      </div>

      <div className="account-panel recent-purchases-panel">
        <div className="account-panel-heading">
          <div>
            <span>Recent Purchases</span>
            <h2>Your latest resources</h2>
          </div>

          <Link to="/account/receipts">View Receipts</Link>
        </div>

        <div className="recent-purchases-table">
          {purchasedResources.map((item) => (
            <div className="recent-purchase-row" key={item.id}>
              <div>
                <img src={item.image} alt={item.title} />

                <div>
                  <h3>{item.title}</h3>
                  <p>
                    {item.category} / {item.type}
                  </p>
                </div>
              </div>

              <span>{item.purchaseDate}</span>

              <strong>KSh {item.price}</strong>

              <Link to={`/account/reader/${item.slug}`}>Open</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AccountDashboard;