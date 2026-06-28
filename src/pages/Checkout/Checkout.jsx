import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiCreditCard,
  FiDownload,
  FiLock,
  FiMail,
  FiPhone,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

import { useResources } from "../../hooks/useResources.js";
import mpesaLogo from "../../assets/images/mpesa.png";
import "./Checkout.css";

function Checkout() {
  const {
    basketItems,
    basketCount,
    basketTotal,
    basketOldTotal,
    basketSavings,
    clearBasket,
  } = useResources();

  const [customerDetails, setCustomerDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [mpesaNumber, setMpesaNumber] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState("confirm");

  const hasItems = basketItems.length > 0;

  const checkoutIsReady = useMemo(() => {
    return (
      customerDetails.fullName.trim() &&
      customerDetails.email.trim() &&
      customerDetails.phone.trim() &&
      basketItems.length > 0
    );
  }, [customerDetails, basketItems]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setCustomerDetails((currentDetails) => ({
      ...currentDetails,
      [name]: value,
    }));
  };

  const openPaymentModal = (event) => {
    event.preventDefault();

    if (!checkoutIsReady) {
      return;
    }

    setMpesaNumber(customerDetails.phone);
    setPaymentStep("confirm");
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    if (paymentStep === "loading") {
      return;
    }

    setPaymentModalOpen(false);
  };

  const handleConfirmPrompt = () => {
    if (!mpesaNumber.trim()) {
      return;
    }

    setPaymentStep("loading");

    window.setTimeout(() => {
      setPaymentStep("success");
    }, 3200);
  };

  const handleDownloadResources = () => {
    clearBasket();
    setPaymentModalOpen(false);
  };

  if (!hasItems) {
    return (
      <section className="checkout-page">
        <div className="container">
          <div className="checkout-empty">
            <div className="checkout-empty-icon">
              <FiShoppingBag />
            </div>

            <span>Checkout</span>

            <h1>Your basket is empty</h1>

            <p>Add a resource to your basket before proceeding to checkout.</p>

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
    <>
      <section className="checkout-page">
        <div className="container">
          <div className="checkout-header">
            <div>
              <span>Secure Checkout</span>
              <h1>Complete Your Purchase</h1>
            </div>

            <p>
              {basketCount} item{basketCount === 1 ? "" : "s"} in your basket
            </p>
          </div>

          <form className="checkout-layout" onSubmit={openPaymentModal}>
            <div className="checkout-main">
              <div className="checkout-panel">
                <div className="checkout-panel-heading">
                  <span>01</span>

                  <div>
                    <h2>Delivery Details</h2>
                    <p>
                      We will send your purchase confirmation and resource access
                      details to this email.
                    </p>
                  </div>
                </div>

                <div className="checkout-form-grid">
                  <label className="checkout-field checkout-field-full">
                    <span>Full Name</span>

                    <div>
                      <FiUser />
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={customerDetails.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </label>

                  <label className="checkout-field">
                    <span>Email Address</span>

                    <div>
                      <FiMail />
                      <input
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        value={customerDetails.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </label>

                  <label className="checkout-field">
                    <span>M-Pesa Phone Number</span>

                    <div>
                      <FiPhone />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="07XX XXX XXX"
                        value={customerDetails.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </label>
                </div>

                <div className="checkout-account-note">
                  <FiCheck />

                  <p>
                    You can checkout first. After payment, you will be able to
                    download your resources and create an account to save them in
                    your SkillVault library.
                  </p>
                </div>
              </div>

              <div className="checkout-panel">
                <div className="checkout-panel-heading">
                  <span>02</span>

                  <div>
                    <h2>M-Pesa Payment</h2>
                    <p>
                      Pay securely with M-Pesa. A payment prompt will be sent to
                      your phone number before access is confirmed.
                    </p>
                  </div>
                </div>

                <div className="mpesa-only-card">
                  <div className="mpesa-only-logo">
                    <img src={mpesaLogo} alt="M-Pesa" />
                  </div>

                  <div>
                    <strong>M-Pesa STK Push</strong>
                    <p>
                      You will confirm the payment on your phone using your
                      M-Pesa PIN.
                    </p>
                  </div>

                  <span>Selected</span>
                </div>

                <div className="mpesa-instructions">
                  <h3>How it works</h3>

                  <div>
                    <FiCheck />
                    Confirm or edit your M-Pesa number.
                  </div>

                  <div>
                    <FiCheck />
                    Send the payment prompt to your phone.
                  </div>

                  <div>
                    <FiCheck />
                    Enter your M-Pesa PIN on your phone.
                  </div>

                  <div>
                    <FiCheck />
                    Download your resources after confirmation.
                  </div>
                </div>
              </div>

              <Link to="/cart" className="checkout-back-link">
                <FiArrowLeft />
                Back To Cart
              </Link>
            </div>

            <aside className="checkout-summary">
              <div className="checkout-summary-card">
                <span>Order Summary</span>

                <h2>Your Resources</h2>

                <div className="checkout-items">
                  {basketItems.map((item) => (
                    <div className="checkout-item" key={item.id}>
                      <Link to={`/product/${item.slug}`}>
                        <img src={item.image} alt={item.title} />
                      </Link>

                      <div>
                        <h3>
                          <Link to={`/product/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>

                        <p>
                          {item.category} / {item.type}
                        </p>

                        <strong>KSh {item.price}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="checkout-totals">
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

                <div className="checkout-total-row">
                  <p>Total</p>
                  <strong>KSh {basketTotal}</strong>
                </div>

                <button
                  type="submit"
                  className="checkout-pay-btn"
                  disabled={!checkoutIsReady}
                >
                  <FiCreditCard />
                  Pay With M-Pesa
                </button>

                <button
                  type="button"
                  className="checkout-clear-btn"
                  onClick={clearBasket}
                >
                  Clear Basket
                </button>

                <div className="checkout-secure-note">
                  <FiLock />

                  <p>
                    Secure digital checkout. Your files will be delivered through
                    your SkillVault account or purchase email.
                  </p>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </section>

      {paymentModalOpen && (
        <div className="mpesa-modal-backdrop">
          <div className="mpesa-modal" role="dialog" aria-modal="true">
            {paymentStep !== "loading" && (
              <button
                type="button"
                className="mpesa-modal-close"
                onClick={closePaymentModal}
                aria-label="Close payment popup"
              >
                <FiX />
              </button>
            )}

            {paymentStep === "confirm" && (
              <>
                <div className="mpesa-modal-logo">
                  <img src={mpesaLogo} alt="M-Pesa" />
                </div>

                <span className="mpesa-modal-kicker">Confirm Payment</span>

                <h2>Send M-Pesa prompt</h2>

                <p>
                  We will send a payment prompt to this number. You can edit it
                  before continuing.
                </p>

                <label className="mpesa-modal-field">
                  <span>M-Pesa Number</span>

                  <div>
                    <FiPhone />
                    <input
                      type="tel"
                      value={mpesaNumber}
                      onChange={(event) => setMpesaNumber(event.target.value)}
                      placeholder="07XX XXX XXX"
                    />
                  </div>
                </label>

                <div className="mpesa-modal-summary">
                  <div>
                    <p>Amount</p>
                    <strong>KSh {basketTotal}</strong>
                  </div>

                  <div>
                    <p>Resources</p>
                    <strong>
                      {basketCount} item{basketCount === 1 ? "" : "s"}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="mpesa-modal-primary"
                  onClick={handleConfirmPrompt}
                  disabled={!mpesaNumber.trim()}
                >
                  Prompt This Number
                </button>

                <button
                  type="button"
                  className="mpesa-modal-secondary"
                  onClick={closePaymentModal}
                >
                  Cancel
                </button>
              </>
            )}

            {paymentStep === "loading" && (
              <div className="mpesa-loading-state">
                <div className="mpesa-loader">
                  <span />
                  <span />
                  <span />
                </div>

                <span className="mpesa-modal-kicker">Waiting For Payment</span>

                <h2>Check your phone</h2>

                <p>
                  We have prepared an M-Pesa prompt for{" "}
                  <strong>{mpesaNumber}</strong>. Enter your M-Pesa PIN on your
                  phone to complete the purchase.
                </p>

                <div className="mpesa-waiting-box">
                  <FiPhone />
                  <div>
                    <strong>Payment prompt sent</strong>
                    <p>This screen will update once payment is confirmed.</p>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="mpesa-success-state">
                <div className="mpesa-success-icon">
                  <FiCheck />
                </div>

                <span className="mpesa-modal-kicker">Payment Successful</span>

                <h2>Your resources are ready</h2>

                <p>
                  Your payment has been confirmed. You can download your
                  resources now or create an account to save them in your
                  SkillVault library.
                </p>

                <div className="mpesa-success-summary">
                  <div>
                    <p>Paid</p>
                    <strong>KSh {basketTotal}</strong>
                  </div>

                  <div>
                    <p>Phone</p>
                    <strong>{mpesaNumber}</strong>
                  </div>
                </div>

                <div className="mpesa-success-actions">
                  <button
                    type="button"
                    className="mpesa-modal-primary"
                    onClick={handleDownloadResources}
                  >
                    <FiDownload />
                    Download Resources
                  </button>

                  <Link
                    to="/register"
                    className="mpesa-modal-secondary-link"
                    onClick={handleDownloadResources}
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Checkout;