import { Link } from "react-router-dom";
import {
  FiCheck,
  FiCreditCard,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";

import { useResources } from "../../../hooks/useResources.js";

import "./CartNotification.css";

function CartNotification() {
  const { cartNotice, closeCartNotice } = useResources();

  if (!cartNotice.isOpen || !cartNotice.resource) {
    return null;
  }

  const { resource, alreadyInBasket } = cartNotice;

  return (
    <div
      className="cart-notice-region"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <article className="cart-notice">
        <div className="cart-notice-header">
          <div className="cart-notice-status">
            <span className="cart-notice-status-icon" aria-hidden="true">
              <FiCheck />
            </span>

            <div>
              <span className="cart-notice-eyebrow">
                {alreadyInBasket ? "Basket update" : "Added successfully"}
              </span>

              <strong>
                {alreadyInBasket
                  ? "This resource is already in your basket."
                  : "Your resource is ready in the basket."}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="cart-notice-close"
            onClick={closeCartNotice}
            aria-label="Close basket notification"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="cart-notice-resource">
          {resource.image && (
            <div className="cart-notice-image">
              <img src={resource.image} alt="" aria-hidden="true" />
            </div>
          )}

          <div className="cart-notice-resource-copy">
            <span>
              {resource.category}
              {resource.type ? ` / ${resource.type}` : ""}
            </span>

            <h3>{resource.title}</h3>

            {resource.price !== undefined && resource.price !== null && (
              <strong>
                KSh {Number(resource.price || 0).toLocaleString("en-US")}
              </strong>
            )}
          </div>
        </div>

        <div className="cart-notice-actions">
          <Link
            to="/cart"
            className="cart-notice-action cart-notice-action-secondary"
            onClick={closeCartNotice}
          >
            <FiShoppingBag aria-hidden="true" />
            <span>View basket</span>
          </Link>

          <Link
            to="/checkout"
            className="cart-notice-action cart-notice-action-primary"
            onClick={closeCartNotice}
          >
            <FiCreditCard aria-hidden="true" />
            <span>Continue to checkout</span>
          </Link>
        </div>
      </article>
    </div>
  );
}

export default CartNotification;