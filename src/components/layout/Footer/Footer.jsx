import { Link } from "react-router-dom";
import {
  FiTruck,
  FiRefreshCcw,
  FiHeadphones,
  FiMapPin,
  FiPhone,
  FiMail,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiTwitter,
} from "react-icons/fi";

import footerBg from "../../../assets/images/footer-bg.jpg";
import "./Footer.css";

function Footer() {
  return (
    <footer
      className="site-footer"
      style={{
        backgroundImage: `url(${footerBg})`,
      }}
    >
      <div className="footer-overlay">
        <div className="container">
          <div className="footer-service-row">
            <div className="footer-service-item">
              <FiTruck />
              <div>
                <h4>Instant Digital Access</h4>
                <p>Purchased guides are available immediately in your library.</p>
              </div>
            </div>

            <div className="footer-service-item">
              <FiRefreshCcw />
              <div>
                <h4>Practical Resources</h4>
                <p>Guides, templates, checklists, and tools for real progress.</p>
              </div>
            </div>

            <div className="footer-service-item">
              <FiHeadphones />
              <div>
                <h4>Customer Support</h4>
                <p>Get help with purchases, access, payments, and downloads.</p>
              </div>
            </div>
          </div>

          <div className="footer-main">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <img src="/logo.png" alt="SkillVault logo" />
                <span>
                  Skill<span>Vault</span>
                </span>
              </Link>

              <p>
                SkillVault is a practical digital knowledge marketplace for
                guides, templates, checklists, and learning resources that help
                people build skills, grow careers, and take action.
              </p>
            </div>

            <div className="footer-column">
              <h3>Information</h3>

              <ul>
                <li>
                  <Link to="/about">About Us</Link>
                </li>
                <li>
                  <Link to="/categories">All Guides</Link>
                </li>
                <li>
                  <Link to="/blog">Blog</Link>
                </li>
                <li>
                  <Link to="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link to="/contact">Help Center</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Popular Guides</h3>

              <ul>
                <li>
                  <Link to="/categories">Career Guides</Link>
                </li>
                <li>
                  <Link to="/categories">Business Guides</Link>
                </li>
                <li>
                  <Link to="/categories">Money Guides</Link>
                </li>
                <li>
                  <Link to="/categories">Tech Skills</Link>
                </li>
                <li>
                  <Link to="/categories">Templates</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column footer-contact">
              <h3>Store Information</h3>

              <ul>
                <li>
                  <FiMapPin />
                  <span>Digital marketplace for practical learning resources.</span>
                </li>

                <li>
                  <FiPhone />
                  <a href="tel:+254790648219">+254 790 648 219</a>
                </li>

                <li>
                  <FiMail />
                  <a href="mailto:support@skillvault.co.ke">
                    support@skillvault.co.ke
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <nav className="footer-bottom-links" aria-label="Footer navigation">
              <Link to="/categories">Guides</Link>
              <Link to="/categories">Best Sellers</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/contact">Help Center</Link>
              <Link to="/login">My Account</Link>
            </nav>

            <div className="footer-socials">
              <a href="/" aria-label="Facebook">
                <FiFacebook />
              </a>

              <a href="/" aria-label="Instagram">
                <FiInstagram />
              </a>

              <a href="/" aria-label="LinkedIn">
                <FiLinkedin />
              </a>

              <a href="/" aria-label="Twitter">
                <FiTwitter />
              </a>
            </div>

            <p>Powered by SkillVault © 2026. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;