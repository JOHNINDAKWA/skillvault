import { Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

import "../Login/Login.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="auth-page">
      <div className="auth-background" />

      <div className="auth-shell">
        <form className="auth-card">
          <div className="auth-card-heading">
            <span>SkillVault Account</span>

            <h1>Create Account</h1>

            <p>Register to save your purchases and access your digital library anytime.</p>
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
                placeholder="Create a password"
                autoComplete="new-password"
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

          <button type="submit" className="auth-submit-btn">
            Create Account
          </button>

          <p className="auth-switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" className="auth-google-btn">
            <FcGoogle />
            Sign up with Google
          </button>
        </form>
      </div>
    </section>
  );
}

export default Register;