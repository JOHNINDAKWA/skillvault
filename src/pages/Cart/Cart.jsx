import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCreditCard,
  FiImage,
  FiLock,
  FiShoppingBag,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { useResources } from "../../hooks/useResources.js";

import "./Cart.css";

function formatMoney(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-US")}`;
}

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
      <main className="sv-cart-page">
        <div className="container">
          <section className="sv-cart-empty" aria-labelledby="empty-cart-title">
            <span className="sv-cart-empty-icon" aria-hidden="true">
              <FiShoppingBag />
            </span>

            <span className="sv-cart-eyebrow">Your basket</span>

            <h1 id="empty-cart-title">No resources added yet.</h1>

            <p>
              Browse practical guides, templates, playbooks, and planners, then
              add the resources that support what you are working on.
            </p>

            <Link to="/resources" className="sv-cart-empty-link">
              <FiArrowLeft aria-hidden="true" />
              <span>Browse resources</span>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="sv-cart-page">
      <div className="container">
        <header className="sv-cart-header">
          <div>
            <span className="sv-cart-eyebrow">Your basket</span>

            <h1>Review your selected resources.</h1>
          </div>

          <p>
            {basketCount} item{basketCount === 1 ? "" : "s"} ready for
            checkout
          </p>
        </header>

        <div className="sv-cart-layout">
          <section
            className="sv-cart-items-section"
            aria-labelledby="selected-resources-title"
          >
            <div className="sv-cart-items-heading">
              <h2 id="selected-resources-title">Selected resources</h2>

              <button type="button" onClick={clearBasket}>
                <FiX aria-hidden="true" />
                <span>Clear basket</span>
              </button>
            </div>

            <div className="sv-cart-items-list">
              {basketItems.map((item) => {
                const hasDiscount =
                  Number(item.oldPrice) > Number(item.price);

                return (
                  <article
                    className="sv-cart-item"
                    key={item.id || item.slug}
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      className="sv-cart-item-image"
                      aria-label={`View ${item.title}`}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.title} />
                      ) : (
                        <span className="sv-cart-image-placeholder">
                          <FiImage aria-hidden="true" />
                        </span>
                      )}
                    </Link>

                    <div className="sv-cart-item-copy">
                      <span className="sv-cart-item-category">
                        {item.category}
                        {item.type ? ` / ${item.type}` : ""}
                      </span>

                      <h3>
                        <Link to={`/product/${item.slug}`}>{item.title}</Link>
                      </h3>

                      <p>
                        {item.shortDescription ||
                          item.description ||
                          "A practical SkillVault digital resource."}
                      </p>

                      <div className="sv-cart-item-price">
                        <strong>{formatMoney(item.price)}</strong>

                        {hasDiscount && (
                          <del>{formatMoney(item.oldPrice)}</del>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="sv-cart-remove"
                      onClick={() =>
                        removeFromBasket(item.id || item.slug)
                      }
                      aria-label={`Remove ${item.title} from basket`}
                    >
                      <FiTrash2 aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  </article>
                );
              })}
            </div>

            <Link to="/resources" className="sv-cart-continue">
              <FiArrowLeft aria-hidden="true" />
              <span>Continue browsing</span>
            </Link>
          </section>

          <aside className="sv-cart-summary">
            <div className="sv-cart-summary-card">
              <span className="sv-cart-eyebrow">Order summary</span>

              <h2>Basket total</h2>

              <div className="sv-cart-summary-lines">
                <div>
                  <span>Original price</span>
                  <strong>{formatMoney(basketOldTotal)}</strong>
                </div>

                <div>
                  <span>Discount</span>
                  <strong>- {formatMoney(basketSavings)}</strong>
                </div>

                <div>
                  <span>Delivery</span>
                  <strong>Digital</strong>
                </div>
              </div>

              <div className="sv-cart-total">
                <span>Total</span>
                <strong>{formatMoney(basketTotal)}</strong>
              </div>

              <Link to="/checkout" className="sv-cart-checkout">
                <FiCreditCard aria-hidden="true" />
                <span>Proceed to checkout</span>
                <FiArrowUpRight aria-hidden="true" />
              </Link>
            </div>

            <div className="sv-cart-help">
              <h3>Still comparing resources?</h3>

              <p>
                Return to the library to review more guides and practical
                resource packs before checking out.
              </p>

              <Link to="/resources">
                Explore more resources
                <FiArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;