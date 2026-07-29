import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../hooks/useAuth.js";

import AuthPageLoader from "../ui/AuthPageLoader/AuthPageLoader.jsx";

const ADMIN_ROLES = [
  "owner",
  "admin",
  "support",
];

function GuestRoute({
  children,
}) {
  const {
    user,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <AuthPageLoader
        label="Loading SkillVault..."
      />
    );
  }

  if (user) {
    if (
      user.mustChangePassword
    ) {
      return (
        <Navigate
          to="/change-password"
          replace
        />
      );
    }

    const destination =
      ADMIN_ROLES.includes(
        user.role
      )
        ? "/admin"
        : "/account";

    return (
      <Navigate
        to={destination}
        replace
      />
    );
  }

  return children;
}

export default GuestRoute;
