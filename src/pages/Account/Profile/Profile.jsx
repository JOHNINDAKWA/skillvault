import {
  FiCheckCircle,
  FiEdit3,
  FiLock,
  FiMail,
  FiMapPin,
  FiUser,
} from "react-icons/fi";

import "./Profile.css";

function Profile() {
  return (
    <section className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar">
          <FiUser />
        </div>

        <div>
          <span>My Profile</span>
          <h1>Account details</h1>
          <p>
            Manage your SkillVault account information and reading preferences.
          </p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card profile-main-card">
          <div className="profile-card-heading">
            <div>
              <span>Personal Information</span>
              <h2>Your details</h2>
            </div>

            <button type="button">
              <FiEdit3 />
              Edit
            </button>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-item">
              <FiUser />

              <div>
                <span>Full Name</span>
                <strong>Joseph Kulundu</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <FiMail />

              <div>
                <span>Email Address</span>
                <strong>joseph@example.com</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <FiMapPin />

              <div>
                <span>Country</span>
                <strong>Kenya</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-heading">
            <div>
              <span>Security</span>
              <h2>Password</h2>
            </div>
          </div>

          <div className="profile-security-box">
            <FiLock />

            <div>
              <strong>Password protected</strong>
              <p>
                Your account is secured. Password updates will be available when
                authentication is connected.
              </p>
            </div>
          </div>

          <button type="button" className="profile-secondary-btn">
            Change Password
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-card-heading">
            <div>
              <span>Preferences</span>
              <h2>Reading setup</h2>
            </div>
          </div>

          <div className="profile-preference-list">
            <div>
              <span>Reader Theme</span>
              <strong>Saved per reader</strong>
            </div>

            <div>
              <span>Email Receipts</span>
              <strong>Enabled</strong>
            </div>

            <div>
              <span>Resource Access</span>
              <strong>Online library</strong>
            </div>
          </div>
        </div>

        <div className="profile-card profile-status-card">
          <FiCheckCircle />

          <div>
            <span>Account Status</span>
            <h2>Active</h2>
            <p>
              Your account is ready to access purchased resources, receipts, and
              saved items.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;