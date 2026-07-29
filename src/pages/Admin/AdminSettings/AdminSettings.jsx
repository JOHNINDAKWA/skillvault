import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiCreditCard,
  FiEdit3,
  FiEye,
  FiEyeOff,
  FiGlobe,
  FiKey,
  FiLock,
  FiMail,
  FiRefreshCcw,
  FiSave,
  FiSettings,
  FiShield,
  FiTrash2,
  FiUser,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../../hooks/useAuth.js";
import { adminUserService } from "../../../services/adminUserService.js";

import "./AdminSettings.css";

const ROLE_OPTIONS = [
  {
    value: "owner",
    label: "Owner",
  },
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "support",
    label: "Support",
  },
];

function formatRole(role) {
  return (
    ROLE_OPTIONS.find(
      (option) => option.value === role
    )?.label || role
  );
}

function formatStatus(admin) {
  if (admin?.displayStatus) {
    return admin.displayStatus;
  }

  if (!admin?.status) {
    return "Unknown";
  }

  return (
    admin.status.charAt(0).toUpperCase() +
    admin.status.slice(1)
  );
}

function getInitials(fullName) {
  if (!fullName?.trim()) {
    return "SV";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function generateTemporaryPassword() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

  const randomValues = new Uint32Array(14);

  window.crypto.getRandomValues(randomValues);

  return Array.from(
    randomValues,
    (value) =>
      characters[value % characters.length]
  ).join("");
}

function AdminSettings() {
  const { user: currentUser } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [isLoadingAdmins, setIsLoadingAdmins] =
    useState(true);

  const [adminError, setAdminError] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [activeActionId, setActiveActionId] =
    useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [createdCredentials, setCreatedCredentials] =
    useState(null);

  const [copyStatus, setCopyStatus] = useState("");
  const [
    showTemporaryPassword,
    setShowTemporaryPassword,
  ] = useState(false);

  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    role: "admin",
    temporaryPassword: generateTemporaryPassword(),
  });

  const [isCreating, setIsCreating] = useState(false);

  const canManageUsers = ["owner", "admin"].includes(
    currentUser?.role
  );

  const loadAdmins = useCallback(async () => {
    setIsLoadingAdmins(true);
    setAdminError("");

    try {
      const response =
        await adminUserService.listUsers();

      setAdmins(response.data.users);
    } catch (error) {
      setAdminError(error.message);
    } finally {
      setIsLoadingAdmins(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const availableRoles = useMemo(() => {
    if (currentUser?.role === "owner") {
      return ROLE_OPTIONS;
    }

    return ROLE_OPTIONS.filter(
      (option) => option.value !== "owner"
    );
  }, [currentUser?.role]);

  const staffSummary = useMemo(() => {
    const active = admins.filter(
      (admin) => admin.status !== "suspended"
    ).length;

    const owners = admins.filter(
      (admin) => admin.role === "owner"
    ).length;

    return {
      total: admins.length,
      active,
      owners,
    };
  }, [admins]);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setAdminError("");
    setAdminMessage("");
  };

  const regeneratePassword = () => {
    setCreateForm((currentForm) => ({
      ...currentForm,
      temporaryPassword: generateTemporaryPassword(),
    }));

    setShowTemporaryPassword(true);
  };

  const createStaffUser = async (event) => {
    event.preventDefault();

    if (!canManageUsers) {
      return;
    }

    setIsCreating(true);
    setAdminError("");
    setAdminMessage("");
    setCopyStatus("");

    const submittedCredentials = {
      fullName: createForm.fullName.trim(),
      email: createForm.email.trim(),
      role: createForm.role,
      temporaryPassword:
        createForm.temporaryPassword,
    };

    try {
      const response =
        await adminUserService.createUser(
          submittedCredentials
        );

      setAdmins((currentAdmins) => [
        ...currentAdmins,
        response.data.user,
      ]);

      setCreatedCredentials(submittedCredentials);

      setCreateForm({
        fullName: "",
        email: "",
        role: "admin",
        temporaryPassword:
          generateTemporaryPassword(),
      });

      setAdminMessage(response.message);
    } catch (error) {
      setAdminError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const copyCredentials = async () => {
    if (!createdCredentials) {
      return;
    }

    const text = [
      "SkillVault account details",
      `Name: ${createdCredentials.fullName}`,
      `Email: ${createdCredentials.email}`,
      `Temporary password: ${createdCredentials.temporaryPassword}`,
      "",
      "Log in and change this temporary password immediately.",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Account details copied.");
    } catch {
      setCopyStatus(
        "Copy failed. Select and copy the details manually."
      );
    }
  };

  const updateAdminInState = (updatedAdmin) => {
    setAdmins((currentAdmins) =>
      currentAdmins.map((admin) =>
        admin.id === updatedAdmin.id
          ? updatedAdmin
          : admin
      )
    );
  };

  const handleRoleChange = async (
    admin,
    nextRole
  ) => {
    if (
      nextRole === admin.role ||
      !canManageUsers
    ) {
      return;
    }

    setActiveActionId(admin.id);
    setAdminError("");
    setAdminMessage("");

    try {
      const response =
        await adminUserService.updateRole(
          admin.id,
          nextRole
        );

      updateAdminInState(response.data.user);
      setAdminMessage(response.message);
    } catch (error) {
      setAdminError(error.message);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleStatusChange = async (admin) => {
    if (!canManageUsers) {
      return;
    }

    const nextStatus =
      admin.status === "suspended"
        ? "active"
        : "suspended";

    setActiveActionId(admin.id);
    setAdminError("");
    setAdminMessage("");

    try {
      const response =
        await adminUserService.updateStatus(
          admin.id,
          nextStatus
        );

      updateAdminInState(response.data.user);
      setAdminMessage(response.message);
    } catch (error) {
      setAdminError(error.message);
    } finally {
      setActiveActionId(null);
    }
  };

  const confirmRemoveAdmin = async () => {
    if (!deleteTarget) {
      return;
    }

    setActiveActionId(deleteTarget.id);
    setAdminError("");
    setAdminMessage("");

    try {
      const response =
        await adminUserService.removeUser(
          deleteTarget.id
        );

      setAdmins((currentAdmins) =>
        currentAdmins.filter(
          (admin) => admin.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);
      setAdminMessage(response.message);
    } catch (error) {
      setAdminError(error.message);
    } finally {
      setActiveActionId(null);
    }
  };

  const canManageTarget = (admin) => {
    if (!canManageUsers) {
      return false;
    }

    if (admin.id === currentUser?.id) {
      return false;
    }

    if (
      currentUser?.role === "admin" &&
      admin.role === "owner"
    ) {
      return false;
    }

    return true;
  };

  return (
    <main className="settings-pro-page">
      <section className="settings-pro-hero">
        <div>
          <span>Settings</span>
          <h1>Platform settings</h1>

          <p>
            Manage staff access, store information,
            payment configuration, security, and customer
            access defaults.
          </p>
        </div>

        <div className="settings-pro-hero-profile">
          <span className="settings-pro-profile-avatar">
            {getInitials(currentUser?.fullName)}
          </span>

          <div>
            <small>Signed in as</small>
            <strong>
              {currentUser?.fullName ||
                "SkillVault administrator"}
            </strong>
            <span>
              {formatRole(currentUser?.role || "admin")}
            </span>
          </div>
        </div>
      </section>

      {adminError && (
        <div
          className="settings-pro-message is-error"
          role="alert"
        >
          <FiShield aria-hidden="true" />
          <span>{adminError}</span>

          <button
            type="button"
            onClick={() => setAdminError("")}
            aria-label="Dismiss error"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      {adminMessage && (
        <div
          className="settings-pro-message is-success"
          role="status"
        >
          <FiCheckCircle aria-hidden="true" />
          <span>{adminMessage}</span>

          <button
            type="button"
            onClick={() => setAdminMessage("")}
            aria-label="Dismiss success message"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      <section
        className="settings-pro-overview"
        aria-label="Settings overview"
      >
        <article>
          <span className="is-indigo">
            <FiUsers aria-hidden="true" />
          </span>

          <div>
            <strong>{staffSummary.total}</strong>
            <small>Staff accounts</small>
          </div>
        </article>

        <article>
          <span className="is-green">
            <FiUserCheck aria-hidden="true" />
          </span>

          <div>
            <strong>{staffSummary.active}</strong>
            <small>Active users</small>
          </div>
        </article>

        <article>
          <span className="is-gold">
            <FiShield aria-hidden="true" />
          </span>

          <div>
            <strong>{staffSummary.owners}</strong>
            <small>Owners</small>
          </div>
        </article>

        <article>
          <span className="is-blue">
            <FiLock aria-hidden="true" />
          </span>

          <div>
            <strong>Protected</strong>
            <small>Admin access</small>
          </div>
        </article>
      </section>

      <section
        className="settings-pro-access-layout"
        id="staff-access"
      >
        <div className="settings-pro-access-main">
          <article className="settings-pro-panel">
            <div className="settings-pro-panel-heading">
              <div>
                <span>Staff access</span>
                <h2>Create a staff account</h2>

                <p>
                  Add owners, administrators, or support
                  users and issue a temporary password for
                  their first login.
                </p>
              </div>

              <span className="settings-pro-heading-icon">
                <FiUserPlus aria-hidden="true" />
              </span>
            </div>

            {canManageUsers ? (
              <form
                className="settings-pro-create-form"
                onSubmit={createStaffUser}
              >
                <label className="settings-pro-field">
                  <span>Full name</span>

                  <div>
                    <FiUser aria-hidden="true" />

                    <input
                      type="text"
                      name="fullName"
                      placeholder="Staff member's name"
                      value={createForm.fullName}
                      onChange={handleCreateChange}
                      disabled={isCreating}
                      minLength="2"
                      required
                    />
                  </div>
                </label>

                <label className="settings-pro-field">
                  <span>Email address</span>

                  <div>
                    <FiMail aria-hidden="true" />

                    <input
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={createForm.email}
                      onChange={handleCreateChange}
                      disabled={isCreating}
                      required
                    />
                  </div>
                </label>

                <label className="settings-pro-field">
                  <span>Role</span>

                  <select
                    name="role"
                    value={createForm.role}
                    onChange={handleCreateChange}
                    disabled={isCreating}
                  >
                    {availableRoles.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="settings-pro-field">
                  <span>Temporary password</span>

                  <div className="settings-pro-password-field">
                    <FiKey aria-hidden="true" />

                    <input
                      type={
                        showTemporaryPassword
                          ? "text"
                          : "password"
                      }
                      name="temporaryPassword"
                      value={createForm.temporaryPassword}
                      onChange={handleCreateChange}
                      disabled={isCreating}
                      minLength="8"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowTemporaryPassword(
                          (current) => !current
                        )
                      }
                      disabled={isCreating}
                      aria-label={
                        showTemporaryPassword
                          ? "Hide temporary password"
                          : "Show temporary password"
                      }
                    >
                      {showTemporaryPassword ? (
                        <FiEyeOff aria-hidden="true" />
                      ) : (
                        <FiEye aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </label>

                <div className="settings-pro-create-actions">
                  <button
                    type="button"
                    className="settings-pro-secondary-button"
                    onClick={regeneratePassword}
                    disabled={isCreating}
                  >
                    <FiRefreshCcw aria-hidden="true" />
                    Generate password
                  </button>

                  <button
                    type="submit"
                    className="settings-pro-primary-button"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <span
                        className="settings-pro-spinner is-light"
                        aria-hidden="true"
                      />
                    ) : (
                      <FiUserPlus aria-hidden="true" />
                    )}

                    {isCreating
                      ? "Creating account..."
                      : "Create staff user"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="settings-pro-readonly">
                <FiShield aria-hidden="true" />

                <div>
                  <strong>Read-only staff access</strong>
                  <p>
                    Your role can view the staff directory
                    but cannot create or manage accounts.
                  </p>
                </div>
              </div>
            )}
          </article>

          <article className="settings-pro-panel">
            <div className="settings-pro-panel-heading">
              <div>
                <span>Directory</span>
                <h2>Staff accounts</h2>

                <p>
                  Review roles, account status, and access
                  across the SkillVault administration team.
                </p>
              </div>

              <button
                type="button"
                className="settings-pro-refresh-button"
                onClick={loadAdmins}
                disabled={isLoadingAdmins}
              >
                <FiRefreshCcw
                  className={
                    isLoadingAdmins ? "is-spinning" : ""
                  }
                  aria-hidden="true"
                />
                Refresh
              </button>
            </div>

            {isLoadingAdmins ? (
              <div
                className="settings-pro-loading"
                role="status"
              >
                <span
                  className="settings-pro-spinner"
                  aria-hidden="true"
                />

                <strong>Loading staff accounts</strong>
                <p>
                  Retrieving the latest roles and account
                  statuses.
                </p>
              </div>
            ) : admins.length > 0 ? (
              <div className="settings-pro-table-wrap">
                <table className="settings-pro-table">
                  <thead>
                    <tr>
                      <th scope="col">Staff member</th>
                      <th scope="col">Role</th>
                      <th scope="col">Status</th>
                      <th
                        scope="col"
                        className="settings-pro-actions-heading"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {admins.map((admin) => {
                      const isCurrentUser =
                        admin.id === currentUser?.id;

                      const isWorking =
                        activeActionId === admin.id;

                      const targetCanBeManaged =
                        canManageTarget(admin);

                      const displayStatus =
                        formatStatus(admin);

                      return (
                        <tr key={admin.id}>
                          <td data-label="Staff member">
                            <div className="settings-pro-user-cell">
                              <span>
                                {getInitials(admin.fullName)}
                              </span>

                              <div>
                                <strong>
                                  {admin.fullName ||
                                    "Unnamed user"}

                                  {isCurrentUser && (
                                    <em>You</em>
                                  )}
                                </strong>

                                <small>{admin.email}</small>
                              </div>
                            </div>
                          </td>

                          <td data-label="Role">
                            <select
                              className={`settings-pro-role-select is-${admin.role}`}
                              value={admin.role}
                              onChange={(event) =>
                                handleRoleChange(
                                  admin,
                                  event.target.value
                                )
                              }
                              disabled={
                                !targetCanBeManaged ||
                                isWorking
                              }
                            >
                              {ROLE_OPTIONS.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                  disabled={
                                    option.value ===
                                      "owner" &&
                                    currentUser?.role !==
                                      "owner"
                                  }
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td data-label="Status">
                            <button
                              type="button"
                              className={`settings-pro-status-button is-${admin.status}`}
                              onClick={() =>
                                handleStatusChange(admin)
                              }
                              disabled={
                                !targetCanBeManaged ||
                                isWorking
                              }
                              title={
                                admin.status === "suspended"
                                  ? "Reactivate account"
                                  : "Suspend account"
                              }
                            >
                              {isWorking ? (
                                <span
                                  className="settings-pro-spinner is-small"
                                  aria-hidden="true"
                                />
                              ) : (
                                <>
                                  <span aria-hidden="true" />
                                  {displayStatus}
                                </>
                              )}
                            </button>
                          </td>

                          <td data-label="Action">
                            <div className="settings-pro-row-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget(admin)
                                }
                                disabled={
                                  !targetCanBeManaged ||
                                  isWorking
                                }
                                title={
                                  targetCanBeManaged
                                    ? `Remove ${formatRole(
                                        admin.role
                                      )}`
                                    : "This account cannot be removed by you"
                                }
                              >
                                <FiTrash2 aria-hidden="true" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="settings-pro-empty">
                <FiUsers aria-hidden="true" />
                <h3>No staff accounts found</h3>
                <p>
                  Create an owner, administrator, or support
                  account to build the admin team.
                </p>
              </div>
            )}
          </article>
        </div>

        <aside className="settings-pro-access-side">
          <article className="settings-pro-profile-card">
            <span className="settings-pro-profile-card-avatar">
              {getInitials(currentUser?.fullName)}
            </span>

            <div>
              <span>Current session</span>
              <h2>
                {currentUser?.fullName ||
                  "SkillVault administrator"}
              </h2>
              <p>
                {currentUser?.email ||
                  "Authenticated admin account"}
              </p>

              <strong
                className={`is-${currentUser?.role || "admin"}`}
              >
                {formatRole(
                  currentUser?.role || "admin"
                )}
              </strong>
            </div>
          </article>

          <nav
            className="settings-pro-section-nav"
            aria-label="Settings sections"
          >
            <span>Settings sections</span>

            <a href="#staff-access">
              <FiUsers aria-hidden="true" />
              Staff access
            </a>

            <a href="#store-details">
              <FiSettings aria-hidden="true" />
              Store information
            </a>

            <a href="#payment-settings">
              <FiCreditCard aria-hidden="true" />
              Payment setup
            </a>

            <a href="#platform-controls">
              <FiShield aria-hidden="true" />
              Platform controls
            </a>
          </nav>

          <article className="settings-pro-security-note">
            <FiLock aria-hidden="true" />

            <div>
              <span>Access protection</span>
              <h3>Role-based administration</h3>

              <p>
                Staff pages require authenticated accounts
                with assigned roles. Owners retain the
                highest level of control.
              </p>
            </div>
          </article>
        </aside>
      </section>

      <section className="settings-pro-config-grid">
        <article
          className="settings-pro-panel"
          id="store-details"
        >
          <div className="settings-pro-panel-heading">
            <div>
              <span>Store details</span>
              <h2>Basic information</h2>

              <p>
                Core storefront details currently used by
                SkillVault.
              </p>
            </div>

            <span className="settings-pro-heading-icon">
              <FiSettings aria-hidden="true" />
            </span>
          </div>

          <div className="settings-pro-readonly-grid">
            <label>
              <span>Store name</span>
              <input
                type="text"
                defaultValue="SkillVault"
                disabled
              />
            </label>

            <label>
              <span>Support email</span>
              <input
                type="email"
                defaultValue="support@skillvault.co.ke"
                disabled
              />
            </label>

            <label>
              <span>Country</span>
              <input
                type="text"
                defaultValue="Kenya"
                disabled
              />
            </label>

            <label>
              <span>Default currency</span>
              <input
                type="text"
                defaultValue="KSh"
                disabled
              />
            </label>
          </div>

          <div className="settings-pro-coming-soon">
            <FiEdit3 aria-hidden="true" />

            <span>
              Editable store settings will be connected in
              a later release.
            </span>
          </div>
        </article>

        <article
          className="settings-pro-panel"
          id="payment-settings"
        >
          <div className="settings-pro-panel-heading">
            <div>
              <span>Payment setup</span>
              <h2>M-Pesa configuration</h2>

              <p>
                Review the payment identity and customer
                instructions used during checkout.
              </p>
            </div>

            <span className="settings-pro-heading-icon">
              <FiCreditCard aria-hidden="true" />
            </span>
          </div>

          <div className="settings-pro-readonly-grid">
            <label>
              <span>M-Pesa Paybill / Till</span>
              <input
                type="text"
                defaultValue="123456"
                disabled
              />
            </label>

            <label>
              <span>Account name</span>
              <input
                type="text"
                defaultValue="SkillVault"
                disabled
              />
            </label>

            <label className="is-full">
              <span>Payment instructions</span>

              <textarea
                rows="4"
                defaultValue="After payment, customers receive access to their purchased resource in My Library."
                disabled
              />
            </label>
          </div>

          <div className="settings-pro-coming-soon">
            <FiSave aria-hidden="true" />

            <span>
              Stored payment settings will be enabled after
              the configuration API is connected.
            </span>
          </div>
        </article>
      </section>

      <section
        className="settings-pro-controls"
        id="platform-controls"
      >
        <div className="settings-pro-controls-heading">
          <span>Platform controls</span>
          <h2>Current customer and security defaults</h2>

          <p>
            These controls show how the platform is currently
            expected to behave.
          </p>
        </div>

        <div className="settings-pro-control-grid">
          <article>
            <span className="is-indigo">
              <FiShield aria-hidden="true" />
            </span>

            <div>
              <small>Security</small>
              <h3>Admin protection</h3>
              <p>
                Staff pages require authenticated accounts
                with assigned roles.
              </p>
            </div>

            <div className="settings-pro-control-state">
              <FiCheck aria-hidden="true" />
              Required
            </div>
          </article>

          <article>
            <span className="is-green">
              <FiCheckCircle aria-hidden="true" />
            </span>

            <div>
              <small>Customer access</small>
              <h3>Library unlock</h3>
              <p>
                Successful purchases automatically unlock
                protected resources.
              </p>
            </div>

            <div className="settings-pro-control-state">
              <FiCheck aria-hidden="true" />
              Enabled
            </div>
          </article>

          <article>
            <span className="is-orange">
              <FiMail aria-hidden="true" />
            </span>

            <div>
              <small>Receipts</small>
              <h3>Email delivery</h3>
              <p>
                Receipt delivery is prepared for payment
                confirmation events.
              </p>
            </div>

            <div className="settings-pro-control-state">
              <FiCheck aria-hidden="true" />
              Enabled
            </div>
          </article>

          <article>
            <span className="is-blue">
              <FiGlobe aria-hidden="true" />
            </span>

            <div>
              <small>Website</small>
              <h3>Public visibility</h3>
              <p>
                The SkillVault storefront remains available
                to public visitors.
              </p>
            </div>

            <div className="settings-pro-control-state">
              <FiCheck aria-hidden="true" />
              Online
            </div>
          </article>
        </div>
      </section>

      {createdCredentials && (
        <div className="settings-pro-modal-backdrop">
          <div
            className="settings-pro-modal settings-pro-credentials-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="credentials-title"
          >
            <button
              type="button"
              className="settings-pro-modal-close"
              onClick={() =>
                setCreatedCredentials(null)
              }
              aria-label="Close staff account details"
            >
              <FiX aria-hidden="true" />
            </button>

            <span className="settings-pro-modal-icon is-key">
              <FiKey aria-hidden="true" />
            </span>

            <span className="settings-pro-modal-eyebrow">
              Staff account created
            </span>

            <h2 id="credentials-title">
              Temporary login details
            </h2>

            <p>
              Share these details privately. The temporary
              password will not be displayed again after
              this window closes.
            </p>

            <div className="settings-pro-credentials-list">
              <div>
                <span>Full name</span>
                <strong>
                  {createdCredentials.fullName}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {createdCredentials.email}
                </strong>
              </div>

              <div>
                <span>Role</span>
                <strong>
                  {formatRole(
                    createdCredentials.role
                  )}
                </strong>
              </div>

              <div>
                <span>Temporary password</span>
                <strong className="settings-pro-password-value">
                  {createdCredentials.temporaryPassword}
                </strong>
              </div>
            </div>

            {copyStatus && (
              <div
                className="settings-pro-copy-status"
                role="status"
              >
                <FiCheckCircle aria-hidden="true" />
                {copyStatus}
              </div>
            )}

            <div className="settings-pro-modal-actions">
              <button
                type="button"
                onClick={() =>
                  setCreatedCredentials(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="is-primary"
                onClick={copyCredentials}
              >
                <FiCopy aria-hidden="true" />
                Copy details
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="settings-pro-modal-backdrop">
          <div
            className="settings-pro-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-admin-title"
          >
            <button
              type="button"
              className="settings-pro-modal-close"
              onClick={() => setDeleteTarget(null)}
              disabled={
                activeActionId === deleteTarget.id
              }
              aria-label="Close removal confirmation"
            >
              <FiX aria-hidden="true" />
            </button>

            <span className="settings-pro-modal-icon is-danger">
              <FiTrash2 aria-hidden="true" />
            </span>

            <span className="settings-pro-modal-eyebrow">
              Remove staff access
            </span>

            <h2 id="remove-admin-title">
              Remove {deleteTarget.fullName}?
            </h2>

            <p>
              This permanently removes the authentication
              account and SkillVault profile. This action
              cannot be undone.
            </p>

            <div className="settings-pro-delete-summary">
              <strong>{deleteTarget.email}</strong>
              <span>
                {formatRole(deleteTarget.role)}
              </span>
            </div>

            <div className="settings-pro-modal-actions">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={
                  activeActionId === deleteTarget.id
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="is-danger"
                onClick={confirmRemoveAdmin}
                disabled={
                  activeActionId === deleteTarget.id
                }
              >
                {activeActionId ===
                  deleteTarget.id && (
                  <span
                    className="settings-pro-spinner is-light is-small"
                    aria-hidden="true"
                  />
                )}

                {activeActionId === deleteTarget.id
                  ? "Removing..."
                  : "Remove user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminSettings;
