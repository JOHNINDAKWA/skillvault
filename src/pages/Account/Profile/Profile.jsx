import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCheck,
  FiCheckCircle,
  FiEdit3,
  FiLock,
  FiMail,
  FiPhone,
  FiSave,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";

import {
  useAuth,
} from "../../../hooks/useAuth.js";

import "./Profile.css";

function formatLabel(value) {
  if (!value) {
    return "Not available";
  }

  return value
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function getInitials(fullName) {
  if (!fullName?.trim()) {
    return "SV";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Profile() {
  const {
    user,
    updateProfile,
  } = useAuth();

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    formData,
    setFormData,
  ] = useState({
    fullName: "",
    phone: "",
  });

  useEffect(() => {
    setFormData({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
    });
  }, [user]);

  const initials = useMemo(
    () =>
      getInitials(
        user?.fullName
      ),
    [user?.fullName]
  );

  const profileCompletion =
    useMemo(() => {
      const completedFields = [
        user?.fullName,
        user?.email,
        user?.phone,
      ].filter(Boolean).length;

      return Math.round(
        (completedFields / 3) * 100
      );
    }, [
      user?.fullName,
      user?.email,
      user?.phone,
    ]);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (currentData) => ({
        ...currentData,
        [name]: value,
      })
    );

    if (formError) {
      setFormError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const beginEditing = () => {
    setFormData({
      fullName:
        user?.fullName || "",
      phone:
        user?.phone || "",
    });

    setFormError("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setFormData({
      fullName:
        user?.fullName || "",
      phone:
        user?.phone || "",
    });

    setFormError("");
    setIsEditing(false);
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setIsSaving(true);
    setFormError("");
    setSuccessMessage("");

    try {
      await updateProfile({
        fullName:
          formData.fullName.trim(),
        phone:
          formData.phone.trim(),
      });

      setSuccessMessage(
        "Your profile was updated successfully."
      );

      setIsEditing(false);
    } catch (error) {
      setFormError(
        error.message ||
          "Your profile could not be updated."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="profile-v2-page">
      <section className="profile-v2-hero">
        <div className="profile-v2-hero-copy">
          <span>My profile</span>

          <h1>
            Account details
          </h1>

          <p>
            Review your personal information,
            account access, security status, and
            reading preferences.
          </p>
        </div>

        <div className="profile-v2-hero-profile">
          <span className="profile-v2-avatar">
            {initials}
          </span>

          <div>
            <small>
              Signed in as
            </small>

            <strong>
              {user?.fullName ||
                "SkillVault customer"}
            </strong>

            <span>
              {user?.email ||
                "Email not available"}
            </span>
          </div>
        </div>
      </section>

      {formError && (
        <div
          className="profile-v2-message is-error"
          role="alert"
        >
          <FiShield aria-hidden="true" />

          <div>
            <strong>
              Profile update failed
            </strong>

            <span>
              {formError}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setFormError("")
            }
            aria-label="Dismiss error"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          className="profile-v2-message is-success"
          role="status"
        >
          <FiCheckCircle aria-hidden="true" />

          <div>
            <strong>
              Changes saved
            </strong>

            <span>
              {successMessage}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            aria-label="Dismiss success message"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      <section className="profile-v2-overview">
        <article className="profile-v2-overview-card is-featured">
          <div>
            <span>
              Profile completeness
            </span>

            <strong>
              {profileCompletion}%
            </strong>

            <p>
              Add your name and phone number
              to keep your account details
              complete.
            </p>
          </div>

          <div
            className="profile-v2-completion-ring"
            style={{
              "--profile-completion":
                `${profileCompletion * 3.6}deg`,
            }}
            aria-label={`${profileCompletion}% profile complete`}
          >
            <span>
              {profileCompletion}%
            </span>
          </div>
        </article>

        <article className="profile-v2-overview-card">
          <span>
            <FiShield aria-hidden="true" />
          </span>

          <div>
            <small>
              Account role
            </small>

            <strong>
              {formatLabel(
                user?.role
              )}
            </strong>
          </div>
        </article>

        <article className="profile-v2-overview-card">
          <span>
            <FiCheckCircle aria-hidden="true" />
          </span>

          <div>
            <small>
              Account status
            </small>

            <strong>
              {formatLabel(
                user?.status
              )}
            </strong>
          </div>
        </article>
      </section>

      <section className="profile-v2-layout">
        <article className="profile-v2-panel profile-v2-main-panel">
          <div className="profile-v2-panel-heading">
            <div>
              <span>
                Personal information
              </span>

              <h2>
                Your details
              </h2>

              <p>
                Keep your contact information
                accurate so your SkillVault account
                remains easy to manage.
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                className="profile-v2-edit-button"
                onClick={beginEditing}
              >
                <FiEdit3 aria-hidden="true" />
                Edit profile
              </button>
            ) : (
              <button
                type="button"
                className="profile-v2-cancel-button"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                <FiX aria-hidden="true" />
                Cancel
              </button>
            )}
          </div>

          {isEditing ? (
            <form
              className="profile-v2-form"
              onSubmit={handleSubmit}
            >
              <label className="profile-v2-field">
                <span>
                  Full name
                </span>

                <div>
                  <FiUser aria-hidden="true" />

                  <input
                    type="text"
                    name="fullName"
                    value={
                      formData.fullName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    minLength="2"
                    disabled={isSaving}
                    required
                  />
                </div>
              </label>

              <label className="profile-v2-field">
                <span>
                  Phone number
                </span>

                <div>
                  <FiPhone aria-hidden="true" />

                  <input
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="07XX XXX XXX"
                    autoComplete="tel"
                    disabled={isSaving}
                  />
                </div>
              </label>

              <label className="profile-v2-field profile-v2-field-full">
                <span>
                  Email address
                </span>

                <div className="is-readonly">
                  <FiMail aria-hidden="true" />

                  <input
                    type="email"
                    value={
                      user?.email || ""
                    }
                    disabled
                    readOnly
                  />
                </div>

                <small>
                  Email changes will require a
                  separate verification process.
                </small>
              </label>

              <div className="profile-v2-form-actions">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="is-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span
                      className="profile-v2-spinner profile-v2-spinner-small"
                      aria-hidden="true"
                    />
                  ) : (
                    <FiSave aria-hidden="true" />
                  )}

                  {isSaving
                    ? "Saving changes..."
                    : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-v2-info-grid">
              <article>
                <span>
                  <FiUser aria-hidden="true" />
                </span>

                <div>
                  <small>
                    Full name
                  </small>

                  <strong>
                    {user?.fullName ||
                      "Not added"}
                  </strong>
                </div>
              </article>

              <article>
                <span>
                  <FiMail aria-hidden="true" />
                </span>

                <div>
                  <small>
                    Email address
                  </small>

                  <strong>
                    {user?.email ||
                      "Not available"}
                  </strong>
                </div>
              </article>

              <article>
                <span>
                  <FiPhone aria-hidden="true" />
                </span>

                <div>
                  <small>
                    Phone number
                  </small>

                  <strong>
                    {user?.phone ||
                      "Not added"}
                  </strong>
                </div>
              </article>

              <article>
                <span>
                  <FiShield aria-hidden="true" />
                </span>

                <div>
                  <small>
                    Account role
                  </small>

                  <strong>
                    {formatLabel(
                      user?.role
                    )}
                  </strong>
                </div>
              </article>
            </div>
          )}
        </article>

        <aside className="profile-v2-side">
          <article className="profile-v2-panel profile-v2-security-panel">
            <div className="profile-v2-panel-heading">
              <div>
                <span>
                  Security
                </span>

                <h2>
                  Password
                </h2>

                <p>
                  Your account is protected by
                  secure authentication.
                </p>
              </div>

              <span className="profile-v2-heading-icon">
                <FiLock aria-hidden="true" />
              </span>
            </div>

            <div className="profile-v2-security-status">
              <span>
                <FiCheck aria-hidden="true" />
              </span>

              <div>
                <strong>
                  Password protected
                </strong>

                <p>
                  Password changing will be
                  connected in the next
                  authentication step.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="profile-v2-disabled-button"
              disabled
              title="Password changing will be connected next."
            >
              Change password
            </button>
          </article>

          <article className="profile-v2-panel profile-v2-status-panel">
            <span>
              <FiCheckCircle aria-hidden="true" />
            </span>

            <div>
              <small>
                Account status
              </small>

              <h2>
                {formatLabel(
                  user?.status
                )}
              </h2>

              <p>
                Your account can access purchased
                resources, receipts, and saved
                wishlist items.
              </p>
            </div>
          </article>
        </aside>
      </section>

      <section className="profile-v2-panel profile-v2-preferences-panel">
        <div className="profile-v2-panel-heading">
          <div>
            <span>
              Preferences
            </span>

            <h2>
              Reading and account setup
            </h2>

            <p>
              A clear view of the current
              defaults used across your
              SkillVault account.
            </p>
          </div>
        </div>

        <div className="profile-v2-preference-grid">
          <article>
            <span>
              Reader theme
            </span>

            <strong>
              Saved per reader
            </strong>

            <p>
              Your preferred reading view is
              retained for each resource.
            </p>
          </article>

          <article>
            <span>
              Email receipts
            </span>

            <strong>
              Enabled
            </strong>

            <p>
              Payment confirmations and
              receipts are available after
              successful purchases.
            </p>
          </article>

          <article>
            <span>
              Resource access
            </span>

            <strong>
              Online library
            </strong>

            <p>
              Purchased resources remain
              available from your account
              library.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Profile;
