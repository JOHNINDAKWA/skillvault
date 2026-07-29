import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowUpRight,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiImage,
  FiLock,
  FiMail,
  FiPhone,
  FiRefreshCcw,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

import { useResources } from "../../hooks/useResources.js";
import { checkoutService } from "../../services/checkoutService.js";

import mpesaLogo from "../../assets/images/mpesa.png";

import "./Checkout.css";

const SESSION_STORAGE_KEY = "skillvault_checkout_session_v1";
const PURCHASE_ACCESS_STORAGE_KEY =
  "skillvault_purchase_access_v1";
const DOWNLOAD_LINK_WINDOW_MS = 10 * 60 * 1000;

const PRIVACY_NOTICE_ACKNOWLEDGED = true;
const FOLLOW_UP_CONSENT = true;

function formatMoney(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-US")}`;
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function readStoredPurchaseAccess() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.sessionStorage.getItem(
      PURCHASE_ACCESS_STORAGE_KEY
    );

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue);

    if (
      !parsedValue?.orderId ||
      !parsedValue?.orderToken ||
      !parsedValue?.order
    ) {
      window.sessionStorage.removeItem(
        PURCHASE_ACCESS_STORAGE_KEY
      );

      return null;
    }

    return parsedValue;
  } catch (error) {
    console.error(
      "Failed to restore temporary purchase access:",
      error
    );

    window.sessionStorage.removeItem(
      PURCHASE_ACCESS_STORAGE_KEY
    );

    return null;
  }
}

function saveStoredPurchaseAccess(access) {
  if (typeof window === "undefined" || !access) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      PURCHASE_ACCESS_STORAGE_KEY,
      JSON.stringify(access)
    );
  } catch (error) {
    console.error(
      "Failed to save temporary purchase access:",
      error
    );
  }
}

function clearStoredPurchaseAccess() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      PURCHASE_ACCESS_STORAGE_KEY
    );
  } catch (error) {
    console.error(
      "Failed to clear temporary purchase access:",
      error
    );
  }
}

function createResourceSnapshot(item) {
  return {
    id: item.id || null,
    slug: item.slug,
    title: item.title,
    image: item.image || null,
    category: item.category || "",
    type: item.type || "",
  };
}

function findDownloadResource(download, items) {
  return (
    items.find(
      (item) =>
        item.slug === download.slug ||
        String(item.id) === String(download.resourceId)
    ) || null
  );
}

function DownloadLibrary({
  downloads,
  items,
  isRefreshing,
  downloadError,
  onRefresh,
  compact = false,
}) {
  return (
    <section
      className={`sv-download-library ${
        compact ? "is-compact" : ""
      }`}
      aria-labelledby={
        compact
          ? "sv-modal-download-title"
          : "sv-page-download-title"
      }
    >
      <div className="sv-download-library-heading">
        <span
          className="sv-download-library-icon"
          aria-hidden="true"
        >
          <FiBookOpen />
        </span>

        <div>
          <span>Available now</span>

          <h2
            id={
              compact
                ? "sv-modal-download-title"
                : "sv-page-download-title"
            }
          >
            Your purchased resources are ready to download.
          </h2>

          <p>
            Open or save each file to your device. You do not need to
            create an account to use these download buttons.
          </p>
        </div>
      </div>

      {downloads.length > 0 ? (
        <div className="sv-download-list">
          {downloads.map((download) => {
            const resource = findDownloadResource(
              download,
              items
            );

            return (
              <article
                className="sv-download-card"
                key={download.slug || download.url}
              >
                <div className="sv-download-card-cover">
                  {resource?.image ? (
                    <img
                      src={resource.image}
                      alt={resource.title || download.title}
                    />
                  ) : (
                    <span aria-hidden="true">
                      <FiBookOpen />
                    </span>
                  )}
                </div>

                <div className="sv-download-card-copy">
                  <span className="sv-download-ready-label">
                    <FiCheckCircle aria-hidden="true" />
                    Ready to download
                  </span>

                  <h3>{download.title}</h3>

                  <p>
                    Your payment has been confirmed. Download this
                    resource now and save it to your device.
                  </p>
                </div>

                <a
                  href={download.url}
                  target="_blank"
                  rel="noreferrer"
                  className="sv-download-button"
                >
                  <FiDownload aria-hidden="true" />
                  <span>Download now</span>
                  <FiArrowUpRight aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="sv-download-preparing">
          <FiClock aria-hidden="true" />

          <div>
            <strong>Your payment is confirmed.</strong>

            <p>
              The file links are still being prepared. Refresh the
              download links in a moment.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <FiRefreshCcw
              className={isRefreshing ? "is-spinning" : ""}
              aria-hidden="true"
            />

            {isRefreshing ? "Refreshing..." : "Refresh downloads"}
          </button>
        </div>
      )}

      {downloadError && (
        <div className="sv-download-error" role="alert">
          <FiAlertCircle aria-hidden="true" />
          <span>{downloadError}</span>
        </div>
      )}

      {downloads.length > 0 && (
        <button
          type="button"
          className="sv-download-refresh-link"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <FiRefreshCcw
            className={isRefreshing ? "is-spinning" : ""}
            aria-hidden="true"
          />

          {isRefreshing
            ? "Refreshing download links..."
            : "Refresh download links"}
        </button>
      )}
    </section>
  );
}

function Checkout() {
  const {
    basketItems,
    basketCount,
    basketTotal,
    basketOldTotal,
    basketSavings,
    clearBasket,
  } = useResources();

  /*
   * A non-empty basket always represents a new purchase attempt.
   * Previous download access must never replace the payment form for
   * resources that are currently waiting in the basket.
   */
  const hasItems = basketItems.length > 0;

  const [customerDetails, setCustomerDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [mpesaNumber, setMpesaNumber] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState("confirm");
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  /*
   * When the customer reaches checkout with items already in the basket,
   * begin with a fresh checkout instead of restoring an older completed
   * order from this browser tab.
   */
  const [purchaseAccess, setPurchaseAccess] = useState(() => {
    return hasItems
      ? null
      : readStoredPurchaseAccess();
  });

  const [downloads, setDownloads] = useState(() => {
    return purchaseAccess?.downloads || [];
  });

  const [isRefreshingDownloads, setIsRefreshingDownloads] =
    useState(false);

  const [downloadError, setDownloadError] = useState("");

  const startedFields = useRef(new Set());
  const lastSavedSnapshot = useRef("");
  const restoredDownloadsRef = useRef(false);

  const basketSignature = useMemo(
    () =>
      basketItems
        .map((item) => item.slug)
        .filter(Boolean)
        .sort()
        .join("|"),
    [basketItems]
  );

  /*
   * Defensive cleanup for customers who add another resource after a
   * successful purchase. The old download state remains available only
   * while the basket is empty. As soon as a new basket exists, checkout
   * returns to the normal customer-details and payment flow.
   */
  useEffect(() => {
    if (!hasItems) {
      return;
    }

    clearStoredPurchaseAccess();

    if (!purchaseAccess) {
      return;
    }

    setPurchaseAccess(null);
    setDownloads([]);
    setCompletedOrder(null);
    setDownloadError("");
    setPaymentError("");
    setPaymentStep("confirm");
    setPaymentModalOpen(false);
    setAccountCreated(false);

    restoredDownloadsRef.current = false;
  }, [
    hasItems,
    purchaseAccess,
  ]);

  const checkoutIsReady = useMemo(
    () =>
      Boolean(
        customerDetails.fullName.trim() &&
          customerDetails.email.trim() &&
          customerDetails.phone.trim() &&
          basketItems.length > 0 &&
          checkoutSession
      ),
    [customerDetails, basketItems, checkoutSession]
  );

  const downloadItems =
    purchaseAccess?.items?.length > 0
      ? purchaseAccess.items
      : basketItems.map(createResourceSnapshot);

  const refreshDownloadAccess = useCallback(
    async (accessOverride = null, silent = false) => {
      const access = accessOverride || purchaseAccess;

      if (!access?.orderId || !access?.orderToken) {
        return;
      }

      if (!silent) {
        setIsRefreshingDownloads(true);
      }

      setDownloadError("");

      try {
        const response = await checkoutService.getDownloads(
          access.orderId,
          access.orderToken
        );

        const nextDownloads = Array.isArray(
          response.data.downloads
        )
          ? response.data.downloads
          : [];

        const nextAccess = {
          ...access,
          downloads: nextDownloads,
          downloadLinksRefreshedAt: Date.now(),
          downloadLinksExpireAt:
            Date.now() + DOWNLOAD_LINK_WINDOW_MS,
        };

        setDownloads(nextDownloads);
        setPurchaseAccess(nextAccess);
        saveStoredPurchaseAccess(nextAccess);
      } catch (error) {
        setDownloadError(
          error.message ||
            "The download links could not be refreshed."
        );
      } finally {
        if (!silent) {
          setIsRefreshingDownloads(false);
        }
      }
    },
    [purchaseAccess]
  );

  useEffect(() => {
    if (
      restoredDownloadsRef.current ||
      !purchaseAccess?.orderId ||
      !purchaseAccess?.orderToken
    ) {
      return;
    }

    restoredDownloadsRef.current = true;

    setCompletedOrder(purchaseAccess.order);

    if (purchaseAccess.downloads?.length) {
      setDownloads(purchaseAccess.downloads);
    }

    refreshDownloadAccess(purchaseAccess, true);
  }, [purchaseAccess, refreshDownloadAccess]);

  useEffect(() => {
    if (
      purchaseAccess ||
      !hasItems ||
      !basketSignature
    ) {
      return undefined;
    }

    let isMounted = true;

    async function startSession() {
      try {
        const storedValue = window.sessionStorage.getItem(
          SESSION_STORAGE_KEY
        );

        if (storedValue) {
          const storedSession = JSON.parse(storedValue);

          if (
            storedSession.signature === basketSignature &&
            storedSession.id &&
            storedSession.checkoutToken
          ) {
            if (isMounted) {
              setCheckoutSession(storedSession);
            }

            return;
          }
        }
      } catch {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }

      setIsStartingSession(true);

      try {
        const response = await checkoutService.startSession({
          itemSlugs: basketItems.map((item) => item.slug),
          sourcePath: window.location.pathname,
          referrer: document.referrer || null,
        });

        const sessionValue = {
          id: response.data.session.id,
          checkoutToken: response.data.checkoutToken,
          paymentMode: response.data.paymentMode,
          signature: basketSignature,
        };

        window.sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify(sessionValue)
        );

        if (isMounted) {
          setCheckoutSession(sessionValue);
          setCheckoutError("");
        }
      } catch (error) {
        if (isMounted) {
          setCheckoutError(error.message);
        }
      } finally {
        if (isMounted) {
          setIsStartingSession(false);
        }
      }
    }

    startSession();

    return () => {
      isMounted = false;
    };
  }, [
    purchaseAccess,
    hasItems,
    basketSignature,
    basketItems,
  ]);

  useEffect(() => {
    if (!checkoutSession || purchaseAccess) {
      return undefined;
    }

    const snapshot = JSON.stringify(customerDetails);

    if (snapshot === lastSavedSnapshot.current) {
      return undefined;
    }

    const saveTimer = window.setTimeout(async () => {
      try {
        const response = await checkoutService.saveProgress(
          checkoutSession.id,
          checkoutSession.checkoutToken,
          {
            ...customerDetails,
            followUpConsent: FOLLOW_UP_CONSENT,
            privacyNoticeAcknowledged:
              PRIVACY_NOTICE_ACKNOWLEDGED,
            lastStep: "details_entry",
          }
        );

        lastSavedSnapshot.current = snapshot;

        setAccountCreated(
          Boolean(response.data.session.accountCreated)
        );

        setCheckoutError("");
      } catch (error) {
        setCheckoutError(error.message);
      }
    }, 900);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [checkoutSession, customerDetails, purchaseAccess]);

  const trackFieldStarted = async (fieldName) => {
    if (
      !checkoutSession ||
      startedFields.current.has(fieldName)
    ) {
      return;
    }

    startedFields.current.add(fieldName);

    try {
      await checkoutService.trackEvent(
        checkoutSession.id,
        checkoutSession.checkoutToken,
        {
          eventName: "field_started",
          fieldName,
        }
      );
    } catch {
      // Analytics must never interrupt checkout.
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setCustomerDetails((currentDetails) => ({
      ...currentDetails,
      [name]: value,
    }));

    setCheckoutError("");
  };

  const openPaymentModal = async (event) => {
    event.preventDefault();

    if (!checkoutIsReady) {
      return;
    }

    setMpesaNumber(customerDetails.phone);
    setPaymentStep("confirm");
    setPaymentError("");
    setPaymentModalOpen(true);

    try {
      await checkoutService.saveProgress(
        checkoutSession.id,
        checkoutSession.checkoutToken,
        {
          ...customerDetails,
          followUpConsent: FOLLOW_UP_CONSENT,
          privacyNoticeAcknowledged:
            PRIVACY_NOTICE_ACKNOWLEDGED,
          lastStep: "payment_review",
        }
      );

      await checkoutService.trackEvent(
        checkoutSession.id,
        checkoutSession.checkoutToken,
        {
          eventName: "payment_modal_opened",
        }
      );
    } catch (error) {
      setCheckoutError(error.message);
    }
  };

  const closePaymentModal = () => {
    if (paymentStep === "loading") {
      return;
    }

    setPaymentModalOpen(false);
  };

  const loadDownloads = async (orderId, accessToken) => {
    const response = await checkoutService.getDownloads(
      orderId,
      accessToken
    );

    return Array.isArray(response.data.downloads)
      ? response.data.downloads
      : [];
  };

  const pollDarajaOrder = async (orderId, accessToken) => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await sleep(3000);

      const response = await checkoutService.getOrderStatus(
        orderId,
        accessToken
      );

      const order = response.data.order;

      if (order.status === "paid") {
        return order;
      }

      if (
        ["failed", "cancelled", "refunded"].includes(order.status)
      ) {
        throw new Error(
          order.resultDescription ||
            "The M-Pesa payment was not completed."
        );
      }
    }

    throw new Error(
      "Payment confirmation is taking longer than expected. The order remains visible to SkillVault support."
    );
  };

  const handleConfirmPrompt = async () => {
    if (!mpesaNumber.trim() || !checkoutSession) {
      return;
    }

    setPaymentStep("loading");
    setPaymentError("");

    try {
      const response = await checkoutService.initiatePayment(
        checkoutSession.id,
        checkoutSession.checkoutToken,
        {
          mpesaPhone: mpesaNumber,
          fullName: customerDetails.fullName,
          email: customerDetails.email,
          phone: customerDetails.phone,
          followUpConsent: FOLLOW_UP_CONSENT,
          privacyNoticeAcknowledged:
            PRIVACY_NOTICE_ACKNOWLEDGED,
        }
      );

      let order = response.data.order;
      const accessToken = response.data.orderToken;

      if (order.status === "pending") {
        order = await pollDarajaOrder(order.id, accessToken);
      }

      let purchasedDownloads = [];

      try {
        purchasedDownloads = await loadDownloads(
          order.id,
          accessToken
        );
      } catch {
        purchasedDownloads = [];
      }

      const access = {
        orderId: order.id,
        orderToken: accessToken,
        order,
        downloads: purchasedDownloads,
        items: basketItems.map(createResourceSnapshot),
        customerEmail: customerDetails.email,
        savedAt: Date.now(),
        downloadLinksRefreshedAt: Date.now(),
        downloadLinksExpireAt:
          Date.now() + DOWNLOAD_LINK_WINDOW_MS,
      };

      setCompletedOrder(order);
      setDownloads(purchasedDownloads);
      setPurchaseAccess(access);
      saveStoredPurchaseAccess(access);

      setPaymentStep("success");
      setDownloadError("");

      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);

      /*
       * The purchase is already complete. The basket can be cleared
       * without removing the temporary download access stored above.
       */
      clearBasket();
    } catch (error) {
      setPaymentError(error.message);
      setPaymentStep("error");
    }
  };

  const finishCheckout = () => {
    setPaymentModalOpen(false);
  };

  return (
    <>
      <main className="sv-checkout-page">
        <div className="container">
          {purchaseAccess && !hasItems ? (
            <section
              className="sv-purchase-ready-page"
              aria-labelledby="sv-purchase-ready-title"
            >
              <div className="sv-purchase-ready-hero">
                <span
                  className="sv-purchase-ready-icon"
                  aria-hidden="true"
                >
                  <FiCheck />
                </span>

                <div>
                  <span className="sv-checkout-eyebrow">
                    Payment confirmed
                  </span>

                  <h1 id="sv-purchase-ready-title">
                    Your purchase is complete. Your resources are
                    ready.
                  </h1>

                  <p>
                    Download your files below. This access remains
                    available on this checkout page even after the
                    payment popup is closed or the page is reloaded in
                    this browser tab.
                  </p>
                </div>

                <div className="sv-purchase-ready-meta">
                  <div>
                    <span>Amount paid</span>

                    <strong>
                      {formatMoney(
                        purchaseAccess.order?.amount ||
                          completedOrder?.amount ||
                          0
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Receipt</span>

                    <strong>
                      {purchaseAccess.order
                        ?.mpesaReceiptNumber ||
                        purchaseAccess.order?.receiptNumber ||
                        "Recorded"}
                    </strong>
                  </div>
                </div>
              </div>

              <DownloadLibrary
                downloads={downloads}
                items={downloadItems}
                isRefreshing={isRefreshingDownloads}
                downloadError={downloadError}
                onRefresh={() => refreshDownloadAccess()}
              />

              <div className="sv-purchase-ready-actions">
                <Link to="/resources">
                  Continue browsing
                  <FiArrowUpRight aria-hidden="true" />
                </Link>

                {!accountCreated && (
                  <Link
                    to="/register"
                    className="sv-purchase-account-link"
                  >
                    Create an optional account
                  </Link>
                )}
              </div>
            </section>
          ) : !hasItems ? (
            <section
              className="sv-checkout-empty"
              aria-labelledby="checkout-empty-title"
            >
              <span
                className="sv-checkout-empty-icon"
                aria-hidden="true"
              >
                <FiShoppingBag />
              </span>

              <span className="sv-checkout-eyebrow">Checkout</span>

              <h1 id="checkout-empty-title">
                Your basket is empty.
              </h1>

              <p>
                Add a resource to your basket before proceeding to
                checkout.
              </p>

              <Link to="/resources">
                <FiArrowLeft aria-hidden="true" />
                Browse resources
              </Link>
            </section>
          ) : (
            <>
              <header className="sv-checkout-header">
                <div>
                  <span className="sv-checkout-eyebrow">
                    Secure checkout
                  </span>

                  <h1>Complete your purchase.</h1>
                </div>

                <p>
                  {basketCount} item
                  {basketCount === 1 ? "" : "s"} in your basket
                </p>
              </header>

              {checkoutError && (
                <div className="sv-checkout-error" role="alert">
                  <FiAlertCircle aria-hidden="true" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <form
                className="sv-checkout-layout"
                onSubmit={openPaymentModal}
              >
                <div className="sv-checkout-main">
                  <section
                    className="sv-checkout-section"
                    aria-labelledby="customer-details-title"
                  >
                    <div className="sv-checkout-section-heading">
                      <span>01</span>

                      <div>
                        <h2 id="customer-details-title">
                          Customer details
                        </h2>

                        <p>
                          Enter the contact information that will be
                          linked to your order and digital access.
                        </p>
                      </div>
                    </div>

                    <div className="sv-checkout-form-grid">
                      <label className="sv-checkout-field sv-checkout-field-full">
                        <span>Full name</span>

                        <div>
                          <FiUser aria-hidden="true" />

                          <input
                            type="text"
                            name="fullName"
                            autoComplete="name"
                            placeholder="Enter your full name"
                            value={customerDetails.fullName}
                            onFocus={() =>
                              trackFieldStarted("full_name")
                            }
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </label>

                      <label className="sv-checkout-field">
                        <span>Email address</span>

                        <div>
                          <FiMail aria-hidden="true" />

                          <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="name@example.com"
                            value={customerDetails.email}
                            onFocus={() =>
                              trackFieldStarted("email")
                            }
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </label>

                      <label className="sv-checkout-field">
                        <span>M-Pesa phone number</span>

                        <div>
                          <FiPhone aria-hidden="true" />

                          <input
                            type="tel"
                            name="phone"
                            autoComplete="tel"
                            placeholder="07XX XXX XXX"
                            value={customerDetails.phone}
                            onFocus={() =>
                              trackFieldStarted("phone")
                            }
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </label>
                    </div>
                  </section>

                  <section
                    className="sv-checkout-section"
                    aria-labelledby="payment-method-title"
                  >
                    <div className="sv-checkout-section-heading">
                      <span>02</span>

                      <div>
                        <h2 id="payment-method-title">
                          Payment method
                        </h2>

                        <p>
                          Review the selected payment option before
                          continuing.
                        </p>
                      </div>
                    </div>

                    <div className="sv-checkout-payment-card">
                      <div className="sv-checkout-mpesa-logo">
                        <img src={mpesaLogo} alt="M-Pesa" />
                      </div>

                      <div className="sv-checkout-payment-copy">
                        <strong>M-Pesa STK Push</strong>

                        <p>
                          A payment prompt will be sent to the number
                          you confirm. Your M-Pesa PIN is entered only
                          on your phone.
                        </p>
                      </div>

                      <span>
                        {checkoutSession?.paymentMode === "mock"
                          ? "Test mode"
                          : "Selected"}
                      </span>
                    </div>

                    <div className="sv-checkout-payment-steps">
                      <div>
                        <span>01</span>
                        <p>Confirm your M-Pesa phone number.</p>
                      </div>

                      <div>
                        <span>02</span>
                        <p>
                          Approve the payment request on your phone.
                        </p>
                      </div>

                      <div>
                        <span>03</span>
                        <p>
                          Receive access to your purchased resources.
                        </p>
                      </div>
                    </div>
                  </section>

                  <Link to="/cart" className="sv-checkout-back">
                    <FiArrowLeft aria-hidden="true" />
                    Back to basket
                  </Link>
                </div>

                <aside className="sv-checkout-summary">
                  <div className="sv-checkout-summary-card">
                    <span className="sv-checkout-eyebrow">
                      Order summary
                    </span>

                    <h2>Your resources</h2>

                    <div className="sv-checkout-items">
                      {basketItems.map((item) => (
                        <article
                          className="sv-checkout-item"
                          key={item.id || item.slug}
                        >
                          <Link to={`/product/${item.slug}`}>
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                              />
                            ) : (
                              <span className="sv-checkout-image-placeholder">
                                <FiImage aria-hidden="true" />
                              </span>
                            )}
                          </Link>

                          <div>
                            <h3>
                              <Link to={`/product/${item.slug}`}>
                                {item.title}
                              </Link>
                            </h3>

                            <p>
                              {item.category}
                              {item.type ? ` / ${item.type}` : ""}
                            </p>

                            <strong>
                              {formatMoney(item.price)}
                            </strong>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="sv-checkout-totals">
                      <div>
                        <span>Original price</span>
                        <strong>
                          {formatMoney(basketOldTotal)}
                        </strong>
                      </div>

                      <div>
                        <span>Discount</span>
                        <strong>
                          - {formatMoney(basketSavings)}
                        </strong>
                      </div>

                      <div>
                        <span>Delivery</span>
                        <strong>Digital</strong>
                      </div>
                    </div>

                    <div className="sv-checkout-total">
                      <span>Total</span>
                      <strong>{formatMoney(basketTotal)}</strong>
                    </div>

                    <button
                      type="submit"
                      className="sv-checkout-pay"
                      disabled={
                        !checkoutIsReady || isStartingSession
                      }
                    >
                      {isStartingSession ? (
                        <>
                          <span
                            className="sv-checkout-spinner"
                            aria-hidden="true"
                          />
                          Preparing checkout...
                        </>
                      ) : (
                        <>
                          <FiCreditCard aria-hidden="true" />
                          Pay with M-Pesa
                          <FiArrowUpRight aria-hidden="true" />
                        </>
                      )}
                    </button>

                    <div className="sv-checkout-secure-note">
                      <FiLock aria-hidden="true" />

                      <p>
                        SkillVault does not collect or store your
                        M-Pesa PIN.
                      </p>
                    </div>
                  </div>
                </aside>
              </form>
            </>
          )}
        </div>
      </main>

      {paymentModalOpen && (
        <div className="sv-mpesa-backdrop">
          <div
            className={`sv-mpesa-modal ${
              paymentStep === "success"
                ? "sv-mpesa-modal-success"
                : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sv-mpesa-title"
          >
            {paymentStep !== "loading" && (
              <button
                type="button"
                className="sv-mpesa-close"
                onClick={closePaymentModal}
                aria-label="Close payment popup"
              >
                <FiX aria-hidden="true" />
              </button>
            )}

            {paymentStep === "confirm" && (
              <>
                <div className="sv-mpesa-logo">
                  <img src={mpesaLogo} alt="M-Pesa" />
                </div>

                <span className="sv-mpesa-kicker">
                  Confirm payment
                </span>

                <h2 id="sv-mpesa-title">
                  Send the M-Pesa prompt.
                </h2>

                <p>
                  Confirm the number that should receive the payment
                  request.
                </p>

                <label className="sv-mpesa-field">
                  <span>M-Pesa number</span>

                  <div>
                    <FiPhone aria-hidden="true" />

                    <input
                      type="tel"
                      value={mpesaNumber}
                      onFocus={() =>
                        trackFieldStarted("mpesa_phone")
                      }
                      onChange={(event) =>
                        setMpesaNumber(event.target.value)
                      }
                      placeholder="07XX XXX XXX"
                    />
                  </div>
                </label>

                <div className="sv-mpesa-summary">
                  <div>
                    <span>Amount</span>
                    <strong>{formatMoney(basketTotal)}</strong>
                  </div>

                  <div>
                    <span>Resources</span>
                    <strong>
                      {basketCount} item
                      {basketCount === 1 ? "" : "s"}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="sv-mpesa-primary"
                  onClick={handleConfirmPrompt}
                  disabled={!mpesaNumber.trim()}
                >
                  Send payment prompt
                </button>

                <button
                  type="button"
                  className="sv-mpesa-secondary"
                  onClick={closePaymentModal}
                >
                  Cancel
                </button>
              </>
            )}

            {paymentStep === "loading" && (
              <div className="sv-mpesa-state">
                <div
                  className="sv-mpesa-loader"
                  aria-hidden="true"
                >
                  <span />
                  <span />
                  <span />
                </div>

                <span className="sv-mpesa-kicker">
                  Waiting for payment
                </span>

                <h2 id="sv-mpesa-title">Check your phone.</h2>

                <p>
                  {checkoutSession?.paymentMode === "mock"
                    ? "SkillVault is simulating the payment confirmation."
                    : "Complete the M-Pesa prompt on your phone. This screen will update once the payment is confirmed."}
                </p>

                <div className="sv-mpesa-waiting">
                  <FiPhone aria-hidden="true" />

                  <div>
                    <strong>Payment request active</strong>
                    <p>{mpesaNumber}</p>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === "error" && (
              <div className="sv-mpesa-state">
                <FiAlertCircle
                  className="sv-mpesa-state-icon"
                  aria-hidden="true"
                />

                <span className="sv-mpesa-kicker">
                  Payment not completed
                </span>

                <h2 id="sv-mpesa-title">
                  We could not confirm payment.
                </h2>

                <p>{paymentError}</p>

                <button
                  type="button"
                  className="sv-mpesa-primary"
                  onClick={() => setPaymentStep("confirm")}
                >
                  <FiRefreshCcw aria-hidden="true" />
                  Try again
                </button>

                <button
                  type="button"
                  className="sv-mpesa-secondary"
                  onClick={closePaymentModal}
                >
                  Close
                </button>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="sv-mpesa-success-state">
                <span
                  className="sv-mpesa-success-icon"
                  aria-hidden="true"
                >
                  <FiCheck />
                </span>

                <span className="sv-mpesa-kicker">
                  Payment successful
                </span>

                <h2 id="sv-mpesa-title">
                  Your book is ready to download.
                </h2>

                <p>
                  Payment has been confirmed. Use the clear download
                  button below to save your purchased resource.
                </p>

                <div className="sv-mpesa-summary">
                  <div>
                    <span>Paid</span>

                    <strong>
                      {formatMoney(
                        completedOrder?.amount ||
                          purchaseAccess?.order?.amount ||
                          basketTotal
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Receipt</span>

                    <strong>
                      {completedOrder?.mpesaReceiptNumber ||
                        completedOrder?.receiptNumber ||
                        purchaseAccess?.order
                          ?.mpesaReceiptNumber ||
                        purchaseAccess?.order?.receiptNumber ||
                        "Recorded"}
                    </strong>
                  </div>
                </div>

                <DownloadLibrary
                  compact
                  downloads={downloads}
                  items={downloadItems}
                  isRefreshing={isRefreshingDownloads}
                  downloadError={downloadError}
                  onRefresh={() => refreshDownloadAccess()}
                />

                <div className="sv-mpesa-success-actions">
                  <button
                    type="button"
                    className="sv-mpesa-primary"
                    onClick={finishCheckout}
                  >
                    Close and keep downloads on this page
                  </button>

                  {!accountCreated && (
                    <Link
                      to="/register"
                      className="sv-mpesa-register"
                      onClick={finishCheckout}
                    >
                      Create an optional account
                    </Link>
                  )}
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
