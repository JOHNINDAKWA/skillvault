import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  FiArrowUpRight,
  FiHelpCircle,
  FiMail,
  FiMenu,
  FiPhone,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

import Logo from "../../ui/Logo/Logo.jsx";
import { mainNavLinks } from "../../../data/navLinks.js";
import { useResources } from "../../../hooks/useResources.js";

import "./Navbar.css";

function Navbar() {
  const { basketCount } = useResources();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarIsFixed, setNavbarIsFixed] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setNavbarIsFixed(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.removeProperty("overflow");
      return undefined;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.removeProperty("overflow");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`site-header ${navbarIsFixed ? "is-scrolled" : ""}`}>
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-contact">
            <a href="tel:+254790648219">
              <FiPhone aria-hidden="true" />
              <span>+254 790 648 219</span>
            </a>

            <a href="mailto:support@skillvault.co.ke">
              <FiMail aria-hidden="true" />
              <span>support@skillvault.co.ke</span>
            </a>
          </div>

          <p className="top-bar-message">
            Practical knowledge for meaningful progress.
          </p>

          <div className="top-bar-links">
            <Link to="/contact">
              <FiHelpCircle aria-hidden="true" />
              <span>Help</span>
            </Link>

            <Link to="/login">
              <FiUser aria-hidden="true" />
              <span>Account</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="main-navbar">
        <div className="container main-navbar-inner">
          <div className="navbar-brand">
            <Logo />
          </div>

          <nav className="desktop-nav" aria-label="Main navigation">
            {mainNavLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.path}
                className={({ isActive }) =>
                  `desktop-nav-link ${isActive ? "is-active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <Link to="/resources" className="browse-guides-btn">
              <span>Explore Library</span>
              <FiArrowUpRight aria-hidden="true" />
            </Link>

            <Link
              to="/cart"
              className="navbar-icon-link cart-link"
              aria-label={`Shopping cart with ${basketCount} item${
                basketCount === 1 ? "" : "s"
              }`}
            >
              <FiShoppingBag aria-hidden="true" />

              {basketCount > 0 && (
                <span className="cart-count" aria-hidden="true">
                  {basketCount > 99 ? "99+" : basketCount}
                </span>
              )}
            </Link>

            <Link
              to="/login"
              className="navbar-icon-link account-icon-link"
              aria-label="My account"
            >
              <FiUser aria-hidden="true" />
            </Link>

            <button
              type="button"
              className="mobile-menu-button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              {mobileMenuOpen ? (
                <FiX aria-hidden="true" />
              ) : (
                <FiMenu aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`mobile-menu-layer ${mobileMenuOpen ? "is-open" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          className="mobile-menu-backdrop"
          aria-label="Close menu"
          tabIndex={mobileMenuOpen ? 0 : -1}
          onClick={closeMobileMenu}
        />

        <aside
          id="mobile-navigation"
          className="mobile-menu"
          aria-label="Mobile navigation"
        >
          <div className="mobile-menu-header">
            <Logo />

            <button
              type="button"
              className="mobile-menu-close"
              aria-label="Close menu"
              onClick={closeMobileMenu}
            >
              <FiX aria-hidden="true" />
            </button>
          </div>

          <nav className="mobile-nav">
            {mainNavLinks.map((link, index) => (
              <NavLink
                key={link.label}
                to={link.path}
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? "is-active" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <span className="mobile-nav-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span>{link.label}</span>

                <FiArrowUpRight aria-hidden="true" />
              </NavLink>
            ))}
          </nav>

          <div className="mobile-menu-actions">
            <Link
              to="/resources"
              className="mobile-library-link"
              onClick={closeMobileMenu}
            >
              Explore the Library
              <FiArrowUpRight aria-hidden="true" />
            </Link>

            <div className="mobile-quick-links">
              <Link to="/cart" onClick={closeMobileMenu}>
                <FiShoppingBag aria-hidden="true" />
                <span>Cart</span>
                <strong>{basketCount}</strong>
              </Link>

              <Link to="/contact" onClick={closeMobileMenu}>
                <FiHelpCircle aria-hidden="true" />
                <span>Help Center</span>
              </Link>

              <Link to="/login" onClick={closeMobileMenu}>
                <FiUser aria-hidden="true" />
                <span>My Account</span>
              </Link>
            </div>
          </div>

          <div className="mobile-menu-contact">
            <a href="tel:+254790648219">
              <FiPhone aria-hidden="true" />
              +254 790 648 219
            </a>

            <a href="mailto:support@skillvault.co.ke">
              <FiMail aria-hidden="true" />
              support@skillvault.co.ke
            </a>
          </div>
        </aside>
      </div>
    </header>
  );
}

export default Navbar;