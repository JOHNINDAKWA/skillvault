import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiFilter,
  FiRefreshCcw,
  FiSearch,
  FiShoppingBag,
  FiSmartphone,
  FiUser,
  FiXCircle,
} from "react-icons/fi";

import { resources } from "../../../data/resources.js";
import "./AdminOrders.css";

const orderCustomers = [
  {
    name: "Mary Wanjiku",
    email: "mary.wanjiku@email.com",
    phone: "+254 712 440 291",
  },
  {
    name: "Brian Otieno",
    email: "brian.otieno@email.com",
    phone: "+254 701 119 882",
  },
  {
    name: "Grace Njeri",
    email: "grace.njeri@email.com",
    phone: "+254 722 901 331",
  },
  {
    name: "Kevin Mwangi",
    email: "kevin.mwangi@email.com",
    phone: "+254 733 818 020",
  },
  {
    name: "Amina Hassan",
    email: "amina.hassan@email.com",
    phone: "+254 710 662 420",
  },
  {
    name: "Daniel Kiprotich",
    email: "daniel.kiprotich@email.com",
    phone: "+254 745 900 114",
  },
];

const adminOrders = resources.slice(0, 10).map((resource, index) => {
  const customer = orderCustomers[index % orderCustomers.length];

  return {
    id: `SV-ORD-${2401 + index}`,
    receiptId: `SV-RCPT-${3101 + index}`,
    mpesaCode: `QJ${82 + index}K${430 + index}XM`,
    customer,
    resource,
    amount: resource.price,
    status: ["Paid", "Paid", "Pending", "Paid", "Failed", "Refunded"][
      index % 6
    ],
    date: [
      "Today, 10:42 AM",
      "Today, 8:15 AM",
      "Yesterday, 5:40 PM",
      "24 Jun 2026",
      "22 Jun 2026",
      "20 Jun 2026",
      "18 Jun 2026",
      "14 Jun 2026",
      "09 Jun 2026",
      "02 Jun 2026",
    ][index],
  };
});

function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");

  const filteredOrders = useMemo(() => {
    return adminOrders.filter((order) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        order.receiptId.toLowerCase().includes(searchValue) ||
        order.mpesaCode.toLowerCase().includes(searchValue) ||
        order.customer.name.toLowerCase().includes(searchValue) ||
        order.customer.email.toLowerCase().includes(searchValue) ||
        order.customer.phone.toLowerCase().includes(searchValue) ||
        order.resource.title.toLowerCase().includes(searchValue);

      const matchesStatus =
        activeStatus === "All" || order.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, activeStatus]);

  const paidOrders = adminOrders.filter((order) => order.status === "Paid");
  const pendingOrders = adminOrders.filter((order) => order.status === "Pending");
  const failedOrders = adminOrders.filter((order) => order.status === "Failed");

  const totalRevenue = paidOrders.reduce(
    (total, order) => total + order.amount,
    0
  );

  const getStatusIcon = (status) => {
    if (status === "Paid") return <FiCheckCircle />;
    if (status === "Pending") return <FiClock />;
    if (status === "Refunded") return <FiRefreshCcw />;
    return <FiXCircle />;
  };

  return (
    <section className="admin-orders-page">
      <div className="admin-orders-hero">
        <div>
          <span>Order Management</span>

          <h1>Manage M-Pesa orders</h1>

          <p>
            Track customer purchases, verify M-Pesa references, manage receipts,
            and confirm access to purchased SkillVault resources.
          </p>
        </div>

        <button type="button">
          <FiDownload />
          Export Orders
        </button>
      </div>

      <div className="admin-orders-stats">
        <article>
          <FiSmartphone />
          <div>
            <strong>KSh {totalRevenue.toLocaleString()}</strong>
            <span>M-Pesa revenue</span>
          </div>
        </article>

        <article>
          <FiShoppingBag />
          <div>
            <strong>{adminOrders.length}</strong>
            <span>Total orders</span>
          </div>
        </article>

        <article>
          <FiClock />
          <div>
            <strong>{pendingOrders.length}</strong>
            <span>Pending orders</span>
          </div>
        </article>

        <article>
          <FiXCircle />
          <div>
            <strong>{failedOrders.length}</strong>
            <span>Failed payments</span>
          </div>
        </article>
      </div>

      <div className="admin-orders-panel">
        <div className="admin-orders-panel-header">
          <div>
            <span>Transactions</span>
            <h2>Recent M-Pesa orders</h2>
          </div>

          <div className="admin-orders-tools">
            <label className="admin-orders-search">
              <FiSearch />

              <input
                type="search"
                placeholder="Search customer, receipt, M-Pesa code..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="admin-orders-filter">
              <FiFilter />

              <select
                value={activeStatus}
                onChange={(event) => setActiveStatus(event.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-orders-tabs">
          {["All", "Paid", "Pending", "Failed", "Refunded"].map((status) => (
            <button
              type="button"
              key={status}
              className={activeStatus === status ? "is-active" : ""}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="admin-orders-table">
          <div className="admin-orders-table-head">
            <span>Customer</span>
            <span>Resource</span>
            <span>M-Pesa Ref</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
            <span>Actions</span>
          </div>

          {filteredOrders.map((order) => (
            <article className="admin-order-item" key={order.id}>
              <div className="admin-order-customer">
                <div className="admin-order-avatar">
                  <FiUser />
                </div>

                <div>
                  <strong>{order.customer.name}</strong>
                  <small>{order.customer.email}</small>
                  <small>{order.customer.phone}</small>
                </div>
              </div>

              <div className="admin-order-resource">
                <img src={order.resource.image} alt={order.resource.title} />

                <div>
                  <strong>{order.resource.title}</strong>
                  <small>
                    {order.resource.category} / {order.resource.type}
                  </small>
                </div>
              </div>

              <div className="admin-order-mpesa">
                <strong>{order.mpesaCode}</strong>
                <small>{order.receiptId}</small>
              </div>

              <strong>KSh {order.amount.toLocaleString()}</strong>

              <em
                className={`admin-order-status admin-order-status-${order.status.toLowerCase()}`}
              >
                {getStatusIcon(order.status)}
                {order.status}
              </em>

              <span>{order.date}</span>

              <div className="admin-order-actions">
                <Link to={`/product/${order.resource.slug}`} title="View resource">
                  <FiEye />
                </Link>

                <button type="button" title="Download receipt">
                  <FiDownload />
                </button>

                <button type="button" title="Refresh order status">
                  <FiRefreshCcw />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="admin-orders-empty">
            <h3>No orders found</h3>
            <p>Try changing the search term or selected status filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminOrders;