import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiDownload,
  FiEye,
  FiFileText,
  FiImage,
  FiRefreshCcw,
  FiSearch,
  FiShield,
  FiX,
} from "react-icons/fi";

import {
  receiptService,
} from "../../../services/receiptService.js";

import "./Receipts.css";

function formatMoney(amount) {
  return `KSh ${Number(
    amount || 0
  ).toLocaleString("en-US")}`;
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-KE",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}

function formatStatus(status) {
  return String(status || "")
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function extractImageUrl(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  const possibleUrls = [
    value.url,
    value.secureUrl,
    value.secure_url,
    value.src,
  ];

  return (
    possibleUrls.find(
      (url) =>
        typeof url === "string" &&
        url.trim()
    )?.trim() || ""
  );
}

function getImageCandidates(resource) {
  return [
    extractImageUrl(resource?.coverImage),
    extractImageUrl(resource?.image),
    extractImageUrl(resource?.thumbnail),
    extractImageUrl(resource?.gallery?.[0]),
  ].filter(Boolean);
}

function ReceiptResourceImage({
  resource,
}) {
  const candidates =
    getImageCandidates(resource);

  const candidateKey =
    candidates.join("|");

  const [
    candidateIndex,
    setCandidateIndex,
  ] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidateKey]);

  const source =
    candidates[candidateIndex];

  if (!source) {
    return (
      <div className="receipts-v2-image-placeholder">
        <FiImage aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={source}
      alt={
        resource?.title ||
        "SkillVault resource"
      }
      loading="lazy"
      decoding="async"
      onError={() =>
        setCandidateIndex(
          (currentIndex) =>
            currentIndex + 1
        )
      }
    />
  );
}

function Receipts() {
  const [
    receipts,
    setReceipts,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState({
    totalReceipts: 0,
    totalSpent: 0,
    paidCount: 0,
    refundedCount: 0,
  });

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    pageMessage,
    setPageMessage,
  ] = useState("");

  const [
    downloadingOrderId,
    setDownloadingOrderId,
  ] = useState(null);

  const loadReceipts = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const response =
        await receiptService.listReceipts();

      setReceipts(
        response.data.receipts || []
      );

      setSummary(
        response.data.summary || {
          totalReceipts: 0,
          totalSpent: 0,
          paidCount: 0,
          refundedCount: 0,
        }
      );
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const filteredReceipts =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      if (!normalizedSearch) {
        return receipts;
      }

      return receipts.filter(
        (receipt) => {
          const resourceText =
            (receipt.items || [])
              .map((item) =>
                [
                  item.title,
                  item.category,
                  item.type,
                  item.slug,
                ]
                  .filter(Boolean)
                  .join(" ")
              )
              .join(" ");

          const searchableText =
            [
              receipt.receiptNumber,
              receipt.orderNumber,
              receipt.mpesaReceiptNumber,
              receipt.method,
              receipt.status,
              resourceText,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchableText.includes(
            normalizedSearch
          );
        }
      );
    }, [
      receipts,
      searchTerm,
    ]);

  const downloadReceipt = async (
    receipt
  ) => {
    setDownloadingOrderId(
      receipt.id
    );

    setPageError("");
    setPageMessage("");

    try {
      const document =
        await receiptService.downloadReceipt(
          receipt.id
        );

      const url =
        URL.createObjectURL(document);

      const anchor =
        window.document.createElement(
          "a"
        );

      anchor.href = url;

      anchor.download =
        `${receipt.receiptNumber || receipt.orderNumber}.pdf`;

      window.document.body.appendChild(
        anchor
      );

      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);

      setPageMessage(
        `${receipt.receiptNumber || receipt.orderNumber} has been downloaded.`
      );
    } catch (error) {
      setPageError(error.message);
    } finally {
      setDownloadingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <section
        className="receipts-v2-loading"
        role="status"
        aria-live="polite"
      >
        <span
          className="receipts-v2-spinner"
          aria-hidden="true"
        />

        <h1>Loading your receipts</h1>

        <p>
          We are retrieving your completed
          SkillVault payment records.
        </p>
      </section>
    );
  }

  return (
    <main className="receipts-v2-page">
      {pageError && (
        <div
          className="receipts-v2-message is-error"
          role="alert"
        >
          <FiRefreshCcw aria-hidden="true" />

          <div>
            <strong>
              Something needs attention
            </strong>

            <span>{pageError}</span>
          </div>

          <button
            type="button"
            onClick={() => setPageError("")}
            aria-label="Dismiss error"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      {pageMessage && (
        <div
          className="receipts-v2-message is-success"
          role="status"
        >
          <FiCheckCircle aria-hidden="true" />

          <div>
            <strong>Receipt ready</strong>
            <span>{pageMessage}</span>
          </div>

          <button
            type="button"
            onClick={() => setPageMessage("")}
            aria-label="Dismiss message"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      <section className="receipts-v2-hero">
        <div>
          <span>Receipts</span>
          <h1>Your payment history</h1>

          <p>
            Review completed purchases,
            M-Pesa confirmations, and downloadable
            receipts linked to your SkillVault account.
          </p>
        </div>

        <Link to="/resources">
          Buy more resources
          <FiArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section
        className="receipts-v2-summary"
        aria-label="Receipt summary"
      >
        <article className="is-featured">
          <span>
            <FiCreditCard aria-hidden="true" />
          </span>

          <div>
            <small>Total paid</small>
            <strong>
              {formatMoney(summary.totalSpent)}
            </strong>

            <p>
              Confirmed value across completed
              SkillVault purchases.
            </p>
          </div>
        </article>

        <article>
          <span>
            <FiFileText aria-hidden="true" />
          </span>

          <div>
            <small>Total receipts</small>
            <strong>
              {summary.totalReceipts}
            </strong>
          </div>
        </article>

        <article>
          <span>
            <FiCheckCircle aria-hidden="true" />
          </span>

          <div>
            <small>Paid orders</small>
            <strong>
              {summary.paidCount}
            </strong>
          </div>
        </article>

        <article>
          <span>
            <FiRefreshCcw aria-hidden="true" />
          </span>

          <div>
            <small>Refunded orders</small>
            <strong>
              {summary.refundedCount}
            </strong>
          </div>
        </article>
      </section>

      <section className="receipts-v2-panel">
        <div className="receipts-v2-panel-header">
          <div>
            <span>Transaction records</span>
            <h2>Recent receipts</h2>

            <p>
              Showing {filteredReceipts.length} of{" "}
              {receipts.length} receipts
            </p>
          </div>

          <div className="receipts-v2-tools">
            <label className="receipts-v2-search">
              <FiSearch aria-hidden="true" />

              <input
                type="search"
                placeholder="Search receipt, M-Pesa reference, resource..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <FiX aria-hidden="true" />
                </button>
              )}
            </label>

            <button
              type="button"
              className="receipts-v2-refresh"
              onClick={loadReceipts}
              title="Refresh receipts"
            >
              <FiRefreshCcw aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>

        {filteredReceipts.length > 0 ? (
          <div className="receipts-v2-table-wrap">
            <table className="receipts-v2-table">
              <thead>
                <tr>
                  <th scope="col">Receipt</th>
                  <th scope="col">Resource</th>
                  <th scope="col">Date</th>
                  <th scope="col">Method</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th
                    scope="col"
                    className="receipts-v2-actions-heading"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredReceipts.map(
                  (receipt) => {
                    const firstItem =
                      receipt.items?.[0];

                    const additionalItems =
                      Math.max(
                        (
                          receipt.items?.length ||
                          0
                        ) - 1,
                        0
                      );

                    return (
                      <tr key={receipt.id}>
                        <td data-label="Receipt">
                          <div className="receipts-v2-id-block">
                            <strong>
                              {receipt.receiptNumber}
                            </strong>

                            <small>
                              {receipt.mpesaReceiptNumber ||
                                receipt.orderNumber}
                            </small>
                          </div>
                        </td>

                        <td data-label="Resource">
                          <div className="receipts-v2-resource">
                            <ReceiptResourceImage
                              resource={firstItem}
                            />

                            <div>
                              <strong>
                                {firstItem?.title ||
                                  "SkillVault order"}
                              </strong>

                              <small>
                                {firstItem
                                  ? `${firstItem.category || "Resource"} / ${firstItem.type || "Digital"}`
                                  : `${receipt.itemCount || 0} resources`}
                              </small>

                              {additionalItems > 0 && (
                                <em>
                                  +{additionalItems} more
                                </em>
                              )}
                            </div>
                          </div>
                        </td>

                        <td data-label="Date">
                          <span className="receipts-v2-date">
                            {formatDate(
                              receipt.date
                            )}
                          </span>
                        </td>

                        <td data-label="Method">
                          <span className="receipts-v2-method">
                            {receipt.method}
                          </span>
                        </td>

                        <td data-label="Amount">
                          <strong className="receipts-v2-amount">
                            {formatMoney(
                              receipt.amount
                            )}
                          </strong>
                        </td>

                        <td data-label="Status">
                          <span
                            className={`receipts-v2-status is-${receipt.status}`}
                          >
                            <FiCheckCircle aria-hidden="true" />
                            {formatStatus(
                              receipt.status
                            )}
                          </span>
                        </td>

                        <td data-label="Actions">
                          <div className="receipts-v2-actions">
                            {firstItem?.slug ? (
                              <Link
                                to={`/product/${firstItem.slug}`}
                              >
                                <FiEye aria-hidden="true" />
                                View
                              </Link>
                            ) : (
                              <Link to="/account/library">
                                <FiEye aria-hidden="true" />
                                Library
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                downloadReceipt(
                                  receipt
                                )
                              }
                              disabled={
                                downloadingOrderId ===
                                receipt.id
                              }
                            >
                              {downloadingOrderId ===
                              receipt.id ? (
                                <span
                                  className="receipts-v2-spinner receipts-v2-spinner-small"
                                  aria-hidden="true"
                                />
                              ) : (
                                <FiDownload aria-hidden="true" />
                              )}

                              {downloadingOrderId ===
                              receipt.id
                                ? "Preparing..."
                                : "Download"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : receipts.length === 0 ? (
          <div className="receipts-v2-empty">
            <span>
              <FiFileText aria-hidden="true" />
            </span>

            <h3>No receipts yet</h3>

            <p>
              Your receipts will appear here after
              your first completed SkillVault payment.
            </p>

            <Link to="/resources">
              Browse resources
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="receipts-v2-empty">
            <span>
              <FiSearch aria-hidden="true" />
            </span>

            <h3>No matching receipts</h3>

            <p>
              Try another resource title, order number,
              receipt number, or M-Pesa reference.
            </p>

            <button
              type="button"
              onClick={() => setSearchTerm("")}
            >
              Clear search
            </button>
          </div>
        )}
      </section>

      <section className="receipts-v2-security">
        <span>
          <FiShield aria-hidden="true" />
        </span>

        <div>
          <small>Receipt security</small>

          <h2>
            Receipts are generated from your stored
            payment records
          </h2>

          <p>
            Each PDF includes the order number,
            customer details, payment method,
            M-Pesa reference, purchased resources,
            savings, total paid, and payment status.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Receipts;
