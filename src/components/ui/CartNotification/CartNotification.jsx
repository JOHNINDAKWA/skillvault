import { Link } from "react-router-dom";
import {
  FiCheck,
  FiX,
  FiShoppingBag,
  FiCreditCard,
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
    <div className="cart-toast-wrap" role="status" aria-live="polite">
      <div className="cart-toast">
        <div className="cart-toast-success-icon">
          <FiCheck />
        </div>

        <div className="cart-toast-body">
          <div className="cart-toast-top">
            <span>
              {alreadyInBasket ? "Already in basket" : "Added to basket"}
            </span>

            <button
              type="button"
              className="cart-toast-close"
              onClick={closeCartNotice}
              aria-label="Close notification"
            >
              <FiX />
            </button>
          </div>

          <h3>{resource.title}</h3>

          <p>
            {alreadyInBasket
              ? "This resource is already saved in your basket."
              : "This resource has been added successfully."}
          </p>

          <div className="cart-toast-actions">
            <Link
              to="/cart"
              className="cart-toast-link cart-toast-link-light"
              onClick={closeCartNotice}
            >
              <FiShoppingBag />
              View Cart
            </Link>

            <Link
              to="/checkout"
              className="cart-toast-link cart-toast-link-dark"
              onClick={closeCartNotice}
            >
              <FiCreditCard />
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartNotification;