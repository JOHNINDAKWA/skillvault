import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

import { useAuth } from "../../hooks/useAuth.js";

import "../Login/Login.css";

const ADMIN_ROLES = ["owner", "admin", "support"];

function Register() {
  const navigate = useNavigate();
  const { register, clearAuthError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }

    clearAuthError();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setFormError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (response.data?.requiresEmailConfirmation) {
        setSuccessMessage(response.message);
        setFormData((currentData) => ({
          ...currentData,
          password: "",
          confirmPassword: "",
        }));
        return;
      }

      const registeredUser = response.data?.user;
      const destination = ADMIN_ROLES.includes(registeredUser?.role)
        ? "/admin"
        : "/account";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-background" />

      <div className="auth-shell">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-heading">
            <span>SkillVault Account</span>

            <h1>Create Account</h1>

            <p>
              Register to save your purchases and access your digital library
              anytime.
            </p>
          </div>

          {formError && (
            <div className="auth-message auth-message-error" role="alert">
              {formError}
            </div>
          )}

          {successMessage && (
            <div
              className="auth-message auth-message-success"
              role="status"
            >
              {successMessage}
            </div>
          )}

          <label className="auth-field">
            <span>Full Name</span>

            <div>
              <FiUser />

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isSubmitting}
                minLength="2"
                required
              />
            </div>
          </label>

          <label className="auth-field">
            <span>Email Address</span>

            <div>
              <FiMail />

              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
          </label>

          <label className="auth-field">
            <span>Phone Number</span>

            <div>
              <FiPhone />

              <input
                type="tel"
                name="phone"
                placeholder="07XX XXX XXX"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </label>

          <label className="auth-field">
            <span>Password</span>

            <div>
              <FiLock />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                minLength="8"
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword ? "Hide passwords" : "Show passwords"
                }
                disabled={isSubmitting}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <label className="auth-field">
            <span>Confirm Password</span>

            <div>
              <FiLock />

              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Repeat your password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                minLength="8"
                required
              />
            </div>
          </label>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span className="auth-button-spinner" aria-hidden="true" />
            )}

            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>

          <p className="auth-switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="auth-google-btn"
            disabled
            title="Google authentication will be connected later."
          >
            <FcGoogle />
            Google Sign-Up Coming Soon
          </button>
        </form>
      </div>
    </section>
  );
}

export default Register;
