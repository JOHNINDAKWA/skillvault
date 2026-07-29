import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../hooks/useAuth.js";

import AuthPageLoader from "../ui/AuthPageLoader/AuthPageLoader.jsx";

const STAFF_ROLES = [
  "owner",
  "admin",
  "support",
];

function getDefaultDestination(
  user
) {
  return STAFF_ROLES.includes(
    user?.role
  )
    ? "/admin"
    : "/account";
}

function ProtectedRoute({
  children,
  allowedRoles,
  allowPasswordChange = false,
}) {
  const location =
    useLocation();

  const {
    user,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <AuthPageLoader
        label="Checking your account..."
      />
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  if (
    user.mustChangePassword &&
    !allowPasswordChange
  ) {
    return (
      <Navigate
        to="/change-password"
        replace
      />
    );
  }

  if (
    !user.mustChangePassword &&
    allowPasswordChange
  ) {
    return (
      <Navigate
        to={getDefaultDestination(
          user
        )}
        replace
      />
    );
  }

  if (
    Array.isArray(
      allowedRoles
    ) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(
      user.role
    )
  ) {
    return (
      <Navigate
        to="/account"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
