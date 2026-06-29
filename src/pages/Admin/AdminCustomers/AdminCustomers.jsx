import { useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiDownload,
  FiEye,
  FiFilter,
  FiMail,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import "./AdminCustomers.css";

const adminCustomers = [
  {
    id: "SV-CUS-1201",
    name: "Mary Wanjiku",
    email: "mary.wanjiku@email.com",
    phone: "+254 712 440 291",
    location: "Nairobi",
    status: "Active",
    joined: "24 Jun 2026",
    purchases: 4,
    spent: 3650,
  },
  {
    id: "SV-CUS-1202",
    name: "Brian Otieno",
    email: "brian.otieno@email.com",
    phone: "+254 701 119 882",
    location: "Kisumu",
    status: "Active",
    joined: "22 Jun 2026",
    purchases: 2,
    spent: 1840,
  },
  {
    id: "SV-CUS-1203",
    name: "Grace Njeri",
    email: "grace.njeri@email.com",
    phone: "+254 722 901 331",
    location: "Nakuru",
    status: "Active",
    joined: "19 Jun 2026",
    purchases: 5,
    spent: 4920,
  },
  {
    id: "SV-CUS-1204",
    name: "Kevin Mwangi",
    email: "kevin.mwangi@email.com",
    phone: "+254 733 818 020",
    location: "Thika",
    status: "New",
    joined: "16 Jun 2026",
    purchases: 1,
    spent: 249,
  },
  {
    id: "SV-CUS-1205",
    name: "Amina Hassan",
    email: "amina.hassan@email.com",
    phone: "+254 710 662 420",
    location: "Mombasa",
    status: "Active",
    joined: "11 Jun 2026",
    purchases: 3,
    spent: 2270,
  },
  {
    id: "SV-CUS-1206",
    name: "Daniel Kiprotich",
    email: "daniel.kiprotich@email.com",
    phone: "+254 745 900 114",
    location: "Eldoret",
    status: "Inactive",
    joined: "06 Jun 2026",
    purchases: 2,
    spent: 1290,
  },
  {
    id: "SV-CUS-1207",
    name: "Sarah Mutua",
    email: "sarah.mutua@email.com",
    phone: "+254 703 402 891",
    location: "Machakos",
    status: "New",
    joined: "02 Jun 2026",
    purchases: 1,
    spent: 499,
  },
  {
    id: "SV-CUS-1208",
    name: "James Kariuki",
    email: "james.kariuki@email.com",
    phone: "+254 711 582 320",
    location: "Nyeri",
    status: "Active",
    joined: "28 May 2026",
    purchases: 6,
    spent: 5640,
  },
];

function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");

  const filteredCustomers = useMemo(() => {
    return adminCustomers.filter((customer) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        customer.name.toLowerCase().includes(searchValue) ||
        customer.email.toLowerCase().includes(searchValue) ||
        customer.phone.toLowerCase().includes(searchValue) ||
        customer.location.toLowerCase().includes(searchValue);

      const matchesStatus =
        activeStatus === "All" || customer.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, activeStatus]);

  const activeCustomers = adminCustomers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const totalPurchases = adminCustomers.reduce(
    (total, customer) => total + customer.purchases,
    0
  );

  const totalSpent = adminCustomers.reduce(
    (total, customer) => total + customer.spent,
    0
  );

  return (
    <section className="admin-customers-page">
      <div className="admin-customers-hero">
        <div>
          <span>Customer Management</span>

          <h1>Customers</h1>

          <p>
            View customer accounts, contact details, purchase count, and total
            value.
          </p>
        </div>

        <button type="button">
          <FiDownload />
          Export Customers
        </button>
      </div>

      <div className="admin-customers-stats">
        <article>
          <FiUsers />
          <div>
            <strong>{adminCustomers.length}</strong>
            <span>Total customers</span>
          </div>
        </article>

        <article>
          <FiCheckCircle />
          <div>
            <strong>{activeCustomers}</strong>
            <span>Active customers</span>
          </div>
        </article>

        <article>
          <FiShoppingBag />
          <div>
            <strong>{totalPurchases}</strong>
            <span>Total purchases</span>
          </div>
        </article>

        <article>
          <FiUser />
          <div>
            <strong>KSh {totalSpent.toLocaleString()}</strong>
            <span>Total value</span>
          </div>
        </article>
      </div>

      <div className="admin-customers-panel">
        <div className="admin-customers-panel-header">
          <div>
            <span>Accounts</span>
            <h2>Customer list</h2>
          </div>

          <div className="admin-customers-tools">
            <label className="admin-customers-search">
              <FiSearch />

              <input
                type="search"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="admin-customers-filter">
              <FiFilter />

              <select
                value={activeStatus}
                onChange={(event) => setActiveStatus(event.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="New">New</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-customers-tabs">
          {["All", "Active", "New", "Inactive"].map((status) => (
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

        <div className="admin-customers-table">
          <div className="admin-customers-table-head">
            <span>Customer</span>
            <span>Phone</span>
            <span>Location</span>
            <span>Purchases</span>
            <span>Total Spent</span>
            <span>Status</span>
            <span>Joined</span>
            <span>Actions</span>
          </div>

          {filteredCustomers.map((customer) => (
            <article className="admin-customer-row" key={customer.id}>
              <div className="admin-customer-name">
                <div className="admin-customer-avatar">
                  <FiUser />
                </div>

                <div>
                  <strong>{customer.name}</strong>
                  <small>{customer.email}</small>
                </div>
              </div>

              <span>{customer.phone}</span>

              <span>{customer.location}</span>

              <strong>{customer.purchases}</strong>

              <strong>KSh {customer.spent.toLocaleString()}</strong>

              <em
                className={`admin-customer-status admin-customer-status-${customer.status.toLowerCase()}`}
              >
                {customer.status}
              </em>

              <span>{customer.joined}</span>

              <div className="admin-customer-actions">
                <button type="button" title="View customer">
                  <FiEye />
                </button>

                <button type="button" title="Email customer">
                  <FiMail />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="admin-customers-empty">
            <h3>No customers found</h3>
            <p>Try changing the search term or selected status filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminCustomers;