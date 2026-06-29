import { NavLink, Outlet, Link } from "react-router-dom";
import {
  FiBarChart2,
  FiBox,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";

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

          <button type="button">
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;