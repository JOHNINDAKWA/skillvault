import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiHeart,
  FiLock,
  FiMail,
} from "react-icons/fi";

import {
  FcGoogle,
} from "react-icons/fc";

import {
  useAuth,
} from "../../hooks/useAuth.js";

import {
  readPendingWishlist,
} from "../../utils/pendingWishlist.js";

import "./Login.css";
import "./LoginWishlist.css";

const ADMIN_ROLES = [
  "owner",
  "admin",
  "support",
];

function Login() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    login,
    clearAuthError,
  } = useAuth();

  const passwordChanged =
    useMemo(() => {
      const parameters =
        new URLSearchParams(
          location.search
        );

      return parameters.get(
        "passwordChanged"
      ) === "true";
    }, [location.search]);

  const pendingWishlist =
    useMemo(
      () =>
        readPendingWishlist(),
      [location.key]
    );

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    formData,
    setFormData,
  ] = useState({
    email: "",
    password: "",
  });

  const handleChange =
    (event) => {
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

      clearAuthError();
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setIsSubmitting(true);
      setFormError("");

      try {
        const authenticatedUser =
          await login({
            email:
              formData.email.trim(),

            password:
              formData.password,
          });

        if (
          authenticatedUser.mustChangePassword
        ) {
          navigate(
            "/change-password",
            {
              replace: true,
            }
          );

          return;
        }

        const requestedFrom =
          location.state?.from;

        const requestedPath =
          requestedFrom?.pathname
            ? `${requestedFrom.pathname}${requestedFrom.search || ""}`
            : null;

        const pendingPath =
          readPendingWishlist()
            ?.returnTo;

        const defaultPath =
          ADMIN_ROLES.includes(
            authenticatedUser.role
          )
            ? "/admin"
            : "/account";

        navigate(
          requestedPath ||
            pendingPath ||
            defaultPath,
          {
            replace: true,
          }
        );
      } catch (error) {
        setFormError(
          error.message
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <section className="auth-page">
      <div className="auth-background" />

      <div className="auth-shell">
        <form
          className="auth-card"
          onSubmit={
            handleSubmit
          }
        >
          <div className="auth-card-heading">
            <span>
              SkillVault Library
            </span>

            <h1>
              Login
            </h1>

            <p>
              Access your purchased guides, planners, templates, and saved
              resources.
            </p>
          </div>

          {(location.state
            ?.wishlistIntent ||
            pendingWishlist) && (
            <div
              className="auth-message auth-message-wishlist"
              role="status"
            >
              <FiHeart />

              <span>
                Log in to save{" "}
                <strong>
                  {location.state
                    ?.wishlistTitle ||
                    pendingWishlist
                      ?.title ||
                    "this resource"}
                </strong>
                . It will be added to your wishlist automatically.
              </span>
            </div>
          )}

          {passwordChanged && (
            <div
              className="auth-message auth-message-success"
              role="status"
            >
              <FiCheckCircle />
              Password changed successfully. Log in using your new password.
            </div>
          )}

          {formError && (
            <div
              className="auth-message auth-message-error"
              role="alert"
            >
              {formError}
            </div>
          )}

          <label className="auth-field">
            <span>
              Email Address
            </span>

            <div>
              <FiMail />

              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                disabled={
                  isSubmitting
                }
                required
              />
            </div>
          </label>

          <label className="auth-field">
            <span>
              Password
            </span>

            <div>
              <FiLock />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                disabled={
                  isSubmitting
                }
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={
                  isSubmitting
                }
              >
                {showPassword ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>
            </div>
          </label>

          <div className="auth-form-row">
            <span className="auth-security-note">
              Secure account access
            </span>

            <Link to="/contact">
              Need help?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={
              isSubmitting
            }
          >
            {isSubmitting && (
              <span
                className="auth-button-spinner"
                aria-hidden="true"
              />
            )}

            {isSubmitting
              ? "Logging In..."
              : pendingWishlist
                ? "Log In And Save"
                : "Login"}
          </button>

          <p className="auth-switch-text">
            No account yet?{" "}
            <Link
              to="/register"
              state={
                location.state
              }
            >
              Create one
            </Link>
          </p>

          <div className="auth-divider">
            <span>
              or
            </span>
          </div>

          <button
            type="button"
            className="auth-google-btn"
            disabled
            title="Google authentication will be connected later."
          >
            <FcGoogle />
            Google Login Coming Soon
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;
