import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
} from "react-icons/fi";

import {
  useAuth,
} from "../../hooks/useAuth.js";

import "./AcceptInvite.css";

const ADMIN_ROLES = [
  "owner",
  "admin",
  "support",
];

function readInviteDetails() {
  const searchParameters =
    new URLSearchParams(
      window.location.search
    );

  const hashValue =
    window.location.hash
      .startsWith("#")
      ? window.location.hash
          .slice(1)
      : window.location.hash;

  const hashParameters =
    new URLSearchParams(
      hashValue
    );

  const errorDescription =
    searchParameters.get(
      "error_description"
    ) ||
    hashParameters.get(
      "error_description"
    );

  return {
    tokenHash:
      searchParameters.get(
        "token_hash"
      ),

    type:
      searchParameters.get(
        "type"
      ),

    accessToken:
      hashParameters.get(
        "access_token"
      ),

    refreshToken:
      hashParameters.get(
        "refresh_token"
      ),

    errorDescription:
      errorDescription
        ? decodeURIComponent(
            errorDescription
          )
        : null,

    errorCode:
      searchParameters.get(
        "error_code"
      ) ||
      hashParameters.get(
        "error_code"
      ),
  };
}

function clearSensitiveUrlValues() {
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );
}

function AcceptInvite() {
  const navigate =
    useNavigate();

  const {
    user,
    isLoading,
    adoptInviteSession,
    verifyInviteSession,
    updatePassword,
  } = useAuth();

  const adoptionStarted =
    useRef(false);

  const [
    inviteState,
    setInviteState,
  ] = useState("preparing");

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    formData,
    setFormData,
  ] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (
      isLoading ||
      adoptionStarted.current
    ) {
      return;
    }

    adoptionStarted.current =
      true;

    async function prepareInvitation() {
      const inviteDetails =
        readInviteDetails();

      if (
        inviteDetails
          .errorDescription
      ) {
        setInviteState(
          "error"
        );

        setPageError(
          inviteDetails
            .errorDescription
        );

        clearSensitiveUrlValues();
        return;
      }

      try {
        if (
          inviteDetails
            .tokenHash &&
          inviteDetails.type ===
            "invite"
        ) {
          await verifyInviteSession(
            inviteDetails
              .tokenHash
          );
        } else if (
          inviteDetails
            .accessToken &&
          inviteDetails
            .refreshToken
        ) {
          await adoptInviteSession({
            accessToken:
              inviteDetails
                .accessToken,

            refreshToken:
              inviteDetails
                .refreshToken,
          });
        } else {
          setInviteState(
            "error"
          );

          setPageError(
            user
              ? "This invitation link has already been removed from the address. Open the newest invitation email or request a new invitation."
              : "This invitation link is incomplete, expired, or has already been used. Ask a SkillVault owner to remove the pending account and send a new invitation."
          );

          return;
        }

        clearSensitiveUrlValues();

        setInviteState(
          "ready"
        );
      } catch (error) {
        clearSensitiveUrlValues();

        setInviteState(
          "error"
        );

        setPageError(
          error.message
        );
      }
    }

    prepareInvitation();
  }, [
    isLoading,
    user,
    adoptInviteSession,
    verifyInviteSession,
  ]);

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

      if (pageError) {
        setPageError("");
      }
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        formData.password !==
        formData.confirmPassword
      ) {
        setPageError(
          "The passwords do not match."
        );

        return;
      }

      setIsSubmitting(true);
      setPageError("");

      try {
        await updatePassword(
          formData.password
        );

        setInviteState(
          "success"
        );

        window.setTimeout(
          () => {
            const destination =
              ADMIN_ROLES.includes(
                user?.role
              )
                ? "/admin"
                : "/account";

            navigate(
              destination,
              {
                replace: true,
              }
            );
          },
          1200
        );
      } catch (error) {
        setPageError(
          error.message
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  return (
    <section className="accept-invite-page">
      <div className="accept-invite-background" />

      <div className="accept-invite-shell">
        <div className="accept-invite-card">
          {inviteState ===
            "preparing" && (
            <div
              className="accept-invite-state"
              role="status"
            >
              <span
                className="accept-invite-spinner"
                aria-hidden="true"
              />

              <span>
                SkillVault Invitation
              </span>

              <h1>
                Preparing your
                account
              </h1>

              <p>
                Please wait while we
                securely verify your
                invitation.
              </p>
            </div>
          )}

          {inviteState ===
            "error" && (
            <div className="accept-invite-state">
              <FiLock />

              <span>
                Invitation Problem
              </span>

              <h1>
                We could not open
                this invitation
              </h1>

              <p>{pageError}</p>
            </div>
          )}

          {inviteState ===
            "ready" && (
            <form
              onSubmit={
                handleSubmit
              }
            >
              <div className="accept-invite-heading">
                <span>
                  Welcome To
                  SkillVault
                </span>

                <h1>
                  Create your
                  password
                </h1>

                <p>
                  Your invitation
                  has been verified.
                  Create a secure
                  password to finish
                  setting up your
                  account.
                </p>
              </div>

              {pageError && (
                <div
                  className="accept-invite-message"
                  role="alert"
                >
                  {pageError}
                </div>
              )}

              <label className="accept-invite-field">
                <span>
                  New Password
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
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength="8"
                    disabled={
                      isSubmitting
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide passwords"
                        : "Show passwords"
                    }
                    disabled={
                      isSubmitting
                    }
                  >
                    {showPassword
                      ? <FiEyeOff />
                      : <FiEye />}
                  </button>
                </div>
              </label>

              <label className="accept-invite-field">
                <span>
                  Confirm Password
                </span>

                <div>
                  <FiLock />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={
                      formData
                        .confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    minLength="8"
                    disabled={
                      isSubmitting
                    }
                    required
                  />
                </div>
              </label>

              <button
                type="submit"
                className="accept-invite-submit"
                disabled={
                  isSubmitting
                }
              >
                {isSubmitting && (
                  <span
                    className="accept-invite-button-spinner"
                    aria-hidden="true"
                  />
                )}

                {isSubmitting
                  ? "Creating Password..."
                  : "Finish Account Setup"}
              </button>
            </form>
          )}

          {inviteState ===
            "success" && (
            <div
              className="accept-invite-state accept-invite-success"
              role="status"
            >
              <FiCheckCircle />

              <span>
                Account Ready
              </span>

              <h1>
                Welcome to
                SkillVault
              </h1>

              <p>
                Your password has
                been created. We are
                opening your
                dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AcceptInvite;
