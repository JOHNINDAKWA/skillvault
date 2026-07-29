import "./AuthPageLoader.css";

function AuthPageLoader({ label = "Loading..." }) {
  return (
    <div
      className="auth-page-loader"
      role="status"
      aria-live="polite"
    >
      <span className="auth-page-loader-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export default AuthPageLoader;
