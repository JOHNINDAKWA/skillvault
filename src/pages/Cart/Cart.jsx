import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCreditCard,
  FiLock,
  FiShoppingBag,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { useResources } from "../../hooks/useResources.js";
import "./Cart.css";

function Cart() {
  const {
    basketItems,
    basketCount,
    basketTotal,
    basketOldTotal,
    basketSavings,
    removeFromBasket,
    clearBasket,
  } = useResources();

  const hasItems = basketItems.length > 0;

  if (!hasItems) {
    return (
      <section className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <FiShoppingBag />
            </div>

            <span>Your Basket Is Empty</span>

            <h1>No resources added yet</h1>

            <p>
              Explore SkillVault resources and add practical guides, templates,
              playbooks, and planners to your basket.
            </p>

            <Link to="/resources">
              <FiArrowLeft />
              Browse Resources
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="container">
        <div className="cart-header">
          <div>
            <span>Your Basket</span>

            <h1>Review Your Resources</h1>
          </div>

          <p>
            {basketCount} item{basketCount === 1 ? "" : "s"} ready for checkout
          </p>
        </div>

        <div className="cart-layout">
          <div className="cart-items-panel">
            <div className="cart-items-top">
              <h2>Selected Resources</h2>

              <button type="button" onClick={clearBasket}>
                <FiX />
                Clear Basket
              </button>
            </div>

            <div className="cart-items-list">
              {basketItems.map((item) => (
                <article className="cart-item" key={item.id}>
                  <Link to={`/product/${item.slug}`} className="cart-item-image">
                    <img src={item.image} alt={item.title} />
                  </Link>

                  <div className="cart-item-content">
                    <span>
                      {item.category} / {item.type}
                    </span>

                    <h3>
                      <Link to={`/product/${item.slug}`}>{item.title}</Link>
                    </h3>

                    <p>{item.description}</p>

                    <div className="cart-item-meta">
                      <strong>KSh {item.price}</strong>
                      <del>KSh {item.oldPrice}</del>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeFromBasket(item.id)}
                    aria-label={`Remove ${item.title} from basket`}
                  >
                    <FiTrash2 />
                    Remove
                  </button>
                </article>
              ))}
            </div>

            <Link to="/resources" className="cart-continue-link">
              <FiArrowLeft />
              Continue Shopping
            </Link>
          </div>

          <aside className="cart-summary-panel">
            <div className="cart-summary-card">
              <span>Order Summary</span>

              <h2>Basket Total</h2>

              <div className="cart-summary-lines">
                <div>
                  <p>Original price</p>
                  <strong>KSh {basketOldTotal}</strong>
                </div>

                <div>
                  <p>Discount</p>
                  <strong>- KSh {basketSavings}</strong>
                </div>

                <div>
                  <p>Delivery</p>
                  <strong>Digital</strong>
                </div>
              </div>

              <div className="cart-summary-total">
                <p>Total</p>
                <strong>KSh {basketTotal}</strong>
              </div>

              <Link to="/checkout" className="cart-checkout-btn">
                <FiCreditCard />
                Proceed To Checkout
              </Link>

              <div className="cart-secure-note">
                <FiLock />
                <p>
                  Secure checkout. Your resources will be available in your
                  SkillVault library after purchase.
                </p>
              </div>
            </div>

            <div className="cart-help-box">
              <h3>Need help choosing?</h3>
              <p>
                You can review each resource before checkout or continue browsing
                for more practical packs.
              </p>
              <Link to="/resources">Explore More Resources</Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Cart;