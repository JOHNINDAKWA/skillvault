import { useState } from "react";
import {
  FiCheckCircle,
  FiCreditCard,
  FiEdit3,
  FiGlobe,
  FiLock,
  FiMail,
  FiSave,
  FiSettings,
  FiShield,
  FiTrash2,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";

import "./AdminSettings.css";

const initialAdmins = [
  {
    id: 1,
    name: "Joseph Kulundu",
    email: "joseph@skillvault.co.ke",
    role: "Owner",
    status: "Active",
  },
  {
    id: 2,
    name: "Mary Wanjiku",
    email: "mary@skillvault.co.ke",
    role: "Admin",
    status: "Active",
  },
  {
    id: 3,
    name: "Brian Otieno",
    email: "brian@skillvault.co.ke",
    role: "Support",
    status: "Pending",
  },
];

function AdminSettings() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const addAdmin = (event) => {
    event.preventDefault();

    if (!newAdminEmail.trim()) {
      return;
    }

    setAdmins((currentAdmins) => [
      ...currentAdmins,
      {
        id: Date.now(),
        name: "New Admin",
        email: newAdminEmail,
        role: "Admin",
        status: "Pending",
      },
    ]);

    setNewAdminEmail("");
  };

  const removeAdmin = (adminId) => {
    setAdmins((currentAdmins) =>
      currentAdmins.filter((admin) => admin.id !== adminId)
    );
  };

  return (
    <section className="admin-settings-page">
      <div className="admin-settings-hero">
        <div>
          <span>Settings</span>

          <h1>Platform settings</h1>

          <p>
            Manage basic SkillVault settings, admin access, payment setup,
            receipts, and customer access defaults.
          </p>
        </div>

        <button type="button">
          <FiSave />
          Save Settings
        </button>
      </div>

      <div className="admin-settings-grid">
        <div className="admin-settings-main">
          <article className="admin-settings-panel">
            <div className="admin-settings-panel-heading">
              <div>
                <span>Store Details</span>
                <h2>Basic information</h2>
              </div>

              <FiSettings />
            </div>

            <div className="admin-settings-form-grid">
              <label className="admin-settings-field">
                <span>Store Name</span>
                <input type="text" defaultValue="SkillVault" />
              </label>

              <label className="admin-settings-field">
                <span>Support Email</span>
                <input type="email" defaultValue="support@skillvault.co.ke" />
              </label>

              <label className="admin-settings-field">
                <span>Country</span>
                <input type="text" defaultValue="Kenya" />
              </label>

              <label className="admin-settings-field">
                <span>Default Currency</span>
                <input type="text" defaultValue="KSh" />
              </label>
            </div>
          </article>

          <article className="admin-settings-panel">
            <div className="admin-settings-panel-heading">
              <div>
                <span>Admin Access</span>
                <h2>Manage admin users</h2>
              </div>

              <FiUsers />
            </div>

            <form className="admin-add-user-form" onSubmit={addAdmin}>
              <label>
                <FiMail />

                <input
                  type="email"
                  placeholder="Enter admin email address"
                  value={newAdminEmail}
                  onChange={(event) => setNewAdminEmail(event.target.value)}
                />
              </label>

              <button type="submit">
                <FiUserPlus />
                Add Admin
              </button>
            </form>

            <div className="admin-users-list">
              {admins.map((admin) => (
                <article className="admin-user-row" key={admin.id}>
                  <div className="admin-user-avatar">
                    {admin.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div className="admin-user-info">
                    <strong>{admin.name}</strong>
                    <span>{admin.email}</span>
                  </div>

                  <select defaultValue={admin.role}>
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Support">Support</option>
                  </select>

                  <em
                    className={`admin-user-status admin-user-status-${admin.status.toLowerCase()}`}
                  >
                    {admin.status}
                  </em>

                  <button
                    type="button"
                    onClick={() => removeAdmin(admin.id)}
                    disabled={admin.role === "Owner"}
                    title={
                      admin.role === "Owner"
                        ? "Owner cannot be removed"
                        : "Remove admin"
                    }
                  >
                    <FiTrash2 />
                  </button>
                </article>
              ))}
            </div>
          </article>

          <article className="admin-settings-panel">
            <div className="admin-settings-panel-heading">
              <div>
                <span>Payment Setup</span>
                <h2>M-Pesa settings</h2>
              </div>

              <FiCreditCard />
            </div>

            <div className="admin-settings-form-grid">
              <label className="admin-settings-field">
                <span>M-Pesa Paybill / Till</span>
                <input type="text" defaultValue="123456" />
              </label>

              <label className="admin-settings-field">
                <span>Account Name</span>
                <input type="text" defaultValue="SkillVault" />
              </label>

              <label className="admin-settings-field admin-settings-field-full">
                <span>Payment Instructions</span>
                <textarea
                  rows="4"
                  defaultValue="After payment, customers receive access to their purchased resource in My Library."
                />
              </label>
            </div>
          </article>
        </div>

        <aside className="admin-settings-side">
          <article className="admin-settings-card">
            <FiShield />

            <div>
              <span>Security</span>
              <h3>Admin protection</h3>
              <p>
                Require admin users to log in before accessing the dashboard.
              </p>

              <label className="admin-toggle-row">
                <span>Require login</span>
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </article>

          <article className="admin-settings-card">
            <FiCheckCircle />

            <div>
              <span>Customer Access</span>
              <h3>Library access</h3>
              <p>
                Automatically unlock purchased resources after confirmed M-Pesa
                payment.
              </p>

              <label className="admin-toggle-row">
                <span>Auto-unlock</span>
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </article>

          <article className="admin-settings-card">
            <FiMail />

            <div>
              <span>Receipts</span>
              <h3>Email receipts</h3>
              <p>
                Send a receipt email after successful purchase confirmation.
              </p>

              <label className="admin-toggle-row">
                <span>Send receipts</span>
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </article>

          <article className="admin-settings-card">
            <FiGlobe />

            <div>
              <span>Website</span>
              <h3>Public visibility</h3>
              <p>
                Keep the SkillVault storefront visible to customers.
              </p>

              <label className="admin-toggle-row">
                <span>Store online</span>
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </article>

          <article className="admin-settings-save-card">
            <FiLock />

            <div>
              <h3>Settings are currently frontend-only</h3>

              <p>
                These controls prepare the dashboard UI. Later, they should save
                to your backend or database.
              </p>

              <button type="button">
                <FiEdit3 />
                Configure Backend
              </button>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

export default AdminSettings;