import { Link } from "react-router-dom";
import "./Logo.css";

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="SkillVault home">
      <span className="logo-icon">
        <img src="/logo.png" alt="SkillVault logo" />
      </span>

      <span className="logo-text">
        Skill<span>Vault</span>
      </span>
    </Link>
  );
}

export default Logo;