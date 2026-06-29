import { Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

import "./Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="auth-page">
      <div className="auth-background" />

      <div className="auth-shell">
        <form className="auth-card">
          <div className="auth-card-heading">
            <span>SkillVault Library</span>

            <h1>Login</h1>

            <p>Access your purchased guides, planners, templates, and saved resources.</p>
          </div>

          <label className="auth-field">
            <span>Email Address</span>

            <div>
              <FiMail />
              <input
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="auth-field">
            <span>Password</span>

            <div>
              <FiLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <div className="auth-form-row">
            <label>
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <Link to="/account" type="submit" className="auth-submit-btn">
            Login
          </Link>

          <p className="auth-switch-text">
            No account yet? <Link to="/register">Create one</Link>
          </p>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" className="auth-google-btn">
            <FcGoogle />
            Continue with Google
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;