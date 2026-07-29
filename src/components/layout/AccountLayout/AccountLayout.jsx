import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import {
  FiBookOpen,
  FiGrid,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiUser,
  FiX,
} from "react-icons/fi";
import { FaReceipt } from "react-icons/fa6";

import { useAuth } from "../../../hooks/useAuth.js";
import Logo from "../../ui/Logo/Logo.jsx";

import "./AccountLayout.css";

const accountLinks = [
  {
    label: "Dashboard",
    path: "/account",
    icon: FiGrid,
    end: true,
  },
  {
    label: "My Library",
    path: "/account/library",
    icon: FiBookOpen,
  },
  {
    label: "Receipts",
    path: "/account/receipts",
    icon: FaReceipt,
  },
  {
    label: "Wishlist",
    path: "/account/wishlist",
    icon: FiHeart,
  },
  {
    label: "Profile",
    path: "/account/profile",
    icon: FiUser,
  },
];

function AccountLayout() {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    setLogoutError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(
        error.message || "Logout failed. Please try again."
      );
    }
  };

  return (
    <div className="account-layout">
      <aside className={`account-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="account-sidebar-top">
          <Logo />

          <button
            type="button"
            className="account-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close account menu"
          >
            <FiX />
          </button>
        </div>

        <nav className="account-nav" aria-label="Account navigation">
          {accountLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.label}
                to={link.path}
                end={link.end}
                onClick={closeSidebar}
              >
                <Icon />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="account-sidebar-bottom">
          <Link to="/resources">
            <FiBookOpen />
            Browse Resources
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <FiLogOut />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>

          {logoutError && (
            <p className="account-logout-error" role="alert">
              {logoutError}
            </p>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="account-sidebar-backdrop"
          onClick={closeSidebar}
          aria-label="Close account menu"
        />
      )}

      <div className="account-main-shell">
        <header className="account-header">
          <button
            type="button"
            className="account-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open account menu"
          >
            <FiMenu />
          </button>

          <div>
            <span>Client Library</span>
            <strong>{user?.fullName || "SkillVault Account"}</strong>
          </div>

          <Link to="/account/profile" className="account-header-profile">
            <FiSettings />
            Account
          </Link>
        </header>

        <main className="account-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AccountLayout;
