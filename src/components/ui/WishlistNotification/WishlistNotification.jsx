import {
  useEffect,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FiHeart,
  FiLogIn,
  FiX,
} from "react-icons/fi";

import {
  useWishlist,
} from "../../../hooks/useWishlist.js";

import {
  savePendingWishlist,
} from "../../../utils/pendingWishlist.js";

import "./WishlistNotification.css";

function WishlistNotification() {
  const navigate =
    useNavigate();

  const {
    loginPrompt,
    wishlistNotice,
    dismissLoginPrompt,
    dismissWishlistNotice,
  } = useWishlist();

  useEffect(() => {
    if (!wishlistNotice) {
      return undefined;
    }

    const timer =
      window.setTimeout(
        dismissWishlistNotice,
        4200
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    wishlistNotice,
    dismissWishlistNotice,
  ]);

  const continueToLogin =
    () => {
      if (!loginPrompt) {
        return;
      }

      const pendingItem =
        savePendingWishlist({
          resource:
            loginPrompt.resource,
          returnTo:
            loginPrompt.returnTo,
        });

      dismissLoginPrompt();

      navigate(
        "/login",
        {
          state: {
            from: {
              pathname:
                pendingItem.returnTo,
            },
            wishlistIntent:
              true,
            wishlistTitle:
              pendingItem.title,
          },
        }
      );
    };

  return (
    <>
      {loginPrompt && (
        <div className="wishlist-login-backdrop">
          <div
            className="wishlist-login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wishlist-login-title"
          >
            <button
              type="button"
              className="wishlist-login-close"
              onClick={
                dismissLoginPrompt
              }
              aria-label="Close login request"
            >
              <FiX />
            </button>

            <div className="wishlist-login-icon">
              <FiHeart />
            </div>

            <span>
              Save For Later
            </span>

            <h2 id="wishlist-login-title">
              Log in to add this resource
            </h2>

            <p>
              Sign in to save <strong>{loginPrompt.resource.title}</strong> to
              your SkillVault wishlist. It will be added automatically after
              login.
            </p>

            <div className="wishlist-login-actions">
              <button
                type="button"
                onClick={
                  dismissLoginPrompt
                }
              >
                Not Now
              </button>

              <button
                type="button"
                className="is-primary"
                onClick={
                  continueToLogin
                }
              >
                <FiLogIn />
                Log In And Save
              </button>
            </div>
          </div>
        </div>
      )}

      {wishlistNotice && (
        <div
          className={`wishlist-toast wishlist-toast-${wishlistNotice.type}`}
          role={
            wishlistNotice.type ===
            "error"
              ? "alert"
              : "status"
          }
        >
          <div className="wishlist-toast-icon">
            <FiHeart />
          </div>

          <div>
            <strong>
              {wishlistNotice.title}
            </strong>

            <p>
              {wishlistNotice.message}
            </p>
          </div>

          <button
            type="button"
            onClick={
              dismissWishlistNotice
            }
            aria-label="Close wishlist message"
          >
            <FiX />
          </button>
        </div>
      )}
    </>
  );
}

export default WishlistNotification;
