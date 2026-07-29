import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import {
  FiBarChart2,
  FiBox,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import { useState } from "react";

import { useAuth } from "../../../hooks/useAuth.js";
import Logo from "../../ui/Logo/Logo.jsx";

import "./AdminLayout.css";

const adminLinks = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: FiGrid,
    end: true,
  },
  {
    label: "Resources",
    path: "/admin/resources",
    icon: FiBox,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: FiShoppingBag,
  },
  {
    label: "Customers",
    path: "/admin/customers",
    icon: FiUsers,
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: FiBarChart2,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: FiSettings,
  },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { logout, isLoggingOut } = useAuth();
  const [logoutError, setLogoutError] = useState("");

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
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <Link to="/admin" className="admin-brand">
            <Logo />
            <span className="admin-brand-badge">Admin</span>
          </Link>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {adminLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink key={link.label} to={link.path} end={link.end}>
                <Icon />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <Link to="/">View Website</Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <FiLogOut />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>

          {logoutError && (
            <p className="admin-logout-error" role="alert">
              {logoutError}
            </p>
          )}
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
