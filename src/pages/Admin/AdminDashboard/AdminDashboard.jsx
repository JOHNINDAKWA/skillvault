import {
  FiActivity,
  FiArrowUpRight,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";

import { resources } from "../../../data/resources.js";
import "./AdminDashboard.css";

const recentOrders = resources.slice(0, 5).map((resource, index) => ({
  id: `SV-ORD-${2400 + index}`,
  customer: ["Mary Wanjiku", "Brian Otieno", "Grace Njeri", "Kevin Mwangi", "Amina Hassan"][index],
  resource: resource.title,
  amount: resource.price,
  status: ["Paid", "Paid", "Pending", "Paid", "Paid"][index],
  date: ["Today", "Today", "Yesterday", "24 Jun", "23 Jun"][index],
}));

const topResources = resources.slice(0, 4).map((resource, index) => ({
  ...resource,
  sales: [84, 62, 49, 37][index],
}));

function AdminDashboard() {
  const totalRevenue = recentOrders.reduce((total, order) => total + order.amount, 0);

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-hero">
        <div>
          <span>SkillVault Admin</span>
          <h1>Dashboard overview</h1>
          <p>
            Monitor resources, orders, customers, and platform performance from
            one clean admin workspace.
          </p>
        </div>

        <button type="button">
          <FiArrowUpRight />
          Add Resource
        </button>
      </div>

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <FiCreditCard />
          <div>
            <span>KSh {totalRevenue.toLocaleString()}</span>
            <p>Recent revenue</p>
          </div>
        </article>

        <article className="admin-stat-card">
          <FiShoppingBag />
          <div>
            <span>{recentOrders.length}</span>
            <p>Recent orders</p>
          </div>
        </article>

        <article className="admin-stat-card">
          <FiBookOpen />
          <div>
            <span>{resources.length}</span>
            <p>Resources listed</p>
          </div>
        </article>

        <article className="admin-stat-card">
          <FiUsers />
          <div>
            <span>128</span>
            <p>Customers</p>
          </div>
        </article>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span>Orders</span>
              <h2>Recent purchases</h2>
            </div>

            <button type="button">View All</button>
          </div>

          <div className="admin-orders-list">
            {recentOrders.map((order) => (
              <article className="admin-order-row" key={order.id}>
                <div>
                  <strong>{order.customer}</strong>
                  <span>{order.resource}</span>
                </div>

                <p>{order.date}</p>

                <strong>KSh {order.amount.toLocaleString()}</strong>

                <em className={order.status === "Paid" ? "is-paid" : "is-pending"}>
                  {order.status === "Paid" ? <FiCheckCircle /> : <FiClock />}
                  {order.status}
                </em>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span>Resources</span>
              <h2>Top sellers</h2>
            </div>

            <button type="button">Manage</button>
          </div>

          <div className="admin-top-resources">
            {topResources.map((resource) => (
              <article className="admin-resource-row" key={resource.id}>
                <img src={resource.image} alt={resource.title} />

                <div>
                  <strong>{resource.title}</strong>
                  <span>{resource.category}</span>
                </div>

                <p>{resource.sales} sales</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span>Platform Health</span>
            <h2>Today’s admin snapshot</h2>
          </div>
        </div>

        <div className="admin-health-grid">
          <article>
            <FiActivity />
            <div>
              <strong>Checkout flow</strong>
              <span>Running normally</span>
            </div>
          </article>

          <article>
            <FiCheckCircle />
            <div>
              <strong>PDF reader</strong>
              <span>Active and available</span>
            </div>
          </article>

          <article>
            <FiClock />
            <div>
              <strong>Pending orders</strong>
              <span>1 order needs confirmation</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;