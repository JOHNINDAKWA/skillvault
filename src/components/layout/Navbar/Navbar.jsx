import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiPhone,
  FiMail,
  FiHelpCircle,
} from "react-icons/fi";

import Logo from "../../ui/Logo/Logo.jsx";
import { mainNavLinks } from "../../../data/navLinks.js";
import { useResources } from "../../../hooks/useResources.js";
import "./Navbar.css";

function Navbar() {
  const { basketCount } = useResources();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarIsFixed, setNavbarIsFixed] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setNavbarIsFixed(window.scrollY > 70);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-left">
            <a href="tel:+254790648219">
              <FiPhone />
              +254 790 648 219
            </a>

            <a href="mailto:support@skillvault.co.ke">
              <FiMail />
              support@skillvault.co.ke
            </a>
          </div>

          <div className="top-bar-right">
            <Link to="/contact">
              <FiHelpCircle />
              Help Center
            </Link>

            <Link to="/login">
              <FiUser />
              My Account
            </Link>
          </div>
        </div>
      </div>

      <div className={`main-navbar ${navbarIsFixed ? "is-fixed" : ""}`}>
        <div className="container main-navbar-inner">
          <Logo />

          <nav className="desktop-nav" aria-label="Main navigation">
            {mainNavLinks.map((link) => (
              <NavLink key={link.label} to={link.path}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <Link to="/resources" className="browse-guides-btn">
              Browse Resources
            </Link>

            <Link to="/cart" className="cart-link" aria-label="Cart">
              <FiShoppingCart />

              <span className={basketCount > 0 ? "has-items" : ""}>
                {basketCount}
              </span>
            </Link>

            <Link
              to="/login"
              className="account-icon-link"
              aria-label="My account"
            >
              <FiUser />
            </Link>

            <button
              type="button"
              className="mobile-menu-button"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {navbarIsFixed && <div className="navbar-spacer" />}

      {mobileMenuOpen && (
        <div className={`mobile-menu ${navbarIsFixed ? "is-fixed-mobile" : ""}`}>
          <div className="container mobile-menu-inner">
            {mainNavLinks.map((link) => (
              <NavLink key={link.label} to={link.path} onClick={closeMobileMenu}>
                {link.label}
              </NavLink>
            ))}

            <div className="mobile-auth-links">
              <Link to="/cart" onClick={closeMobileMenu}>
                Cart ({basketCount})
              </Link>

              <Link to="/contact" onClick={closeMobileMenu}>
                Help Center
              </Link>

              <Link to="/login" onClick={closeMobileMenu}>
                My Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;