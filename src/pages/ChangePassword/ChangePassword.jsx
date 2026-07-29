import { useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiShield,
} from "react-icons/fi";

import { useAuth } from "../../hooks/useAuth.js";

import "./ChangePassword.css";

function ChangePassword() {
  const {
    user,
    updatePassword,
    logout,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (pageError) {
      setPageError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPageError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setPageError("");

    try {
      await updatePassword(formData.password);

      /*
       * A complete sign-out and browser reload prevents the old
       * mustChangePassword state from sending the user back to this page.
       * The user signs in once more using the newly created password.
       */
      try {
        await logout();
      } catch {
        /*
         * AuthContext clears the local user in logout's finally block.
         * Continue to the login page even if server-side revocation reports
         * an error after the password has already changed.
         */
      }

      window.location.replace("/login?passwordChanged=true");
    } catch (error) {
      setPageError(
        error.message || "The password could not be changed."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <section className="change-password-page">
      <div className="change-password-background" />

      <div className="change-password-shell">
        <div className="change-password-card">
          <form onSubmit={handleSubmit}>
            <div className="change-password-heading">
              <div>
                <FiShield />
              </div>

              <span>First Login Security</span>

              <h1>Create a new password</h1>

              <p>
                Hello {user?.fullName || "there"}. Your account was created
                with a temporary password. Replace it before continuing.
              </p>
            </div>

            {pageError && (
              <div className="change-password-error" role="alert">
                {pageError}
              </div>
            )}

            <label className="change-password-field">
              <span>New Password</span>

              <div>
                <FiLock />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength="8"
                  disabled={isSubmitting}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide passwords"
                      : "Show passwords"
                  }
                  disabled={isSubmitting}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <label className="change-password-field">
              <span>Confirm New Password</span>

              <div>
                <FiLock />

                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repeat the new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength="8"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              className="change-password-submit"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span
                  className="change-password-spinner"
                  aria-hidden="true"
                />
              )}

              {isSubmitting
                ? "Updating Password..."
                : "Change Password And Continue"}
            </button>

            <p className="change-password-note">
              After the change, sign in once using your new password.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ChangePassword;
