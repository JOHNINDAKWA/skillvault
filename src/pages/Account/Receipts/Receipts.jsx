import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiDownload,
  FiEye,
  FiFileText,
  FiSearch,
} from "react-icons/fi";

import { resources } from "../../../data/resources.js";
import "./Receipts.css";

const receipts = resources.slice(0, 6).map((resource, index) => ({
  id: `SV-${2026001 + index}`,
  resource,
  amount: resource.price,
  method: ["M-Pesa", "Card", "M-Pesa", "Bank Transfer", "M-Pesa", "Card"][index],
  date: [
    "24 Jun 2026",
    "21 Jun 2026",
    "18 Jun 2026",
    "14 Jun 2026",
    "09 Jun 2026",
    "02 Jun 2026",
  ][index],
  status: "Paid",
}));

function Receipts() {
  const totalSpent = receipts.reduce((total, receipt) => total + receipt.amount, 0);

  return (
    <section className="receipts-page">
      <div className="receipts-hero">
        <div>
          <span>Receipts</span>

          <h1>Your payment history</h1>

          <p>
            View your SkillVault purchases, payment confirmations, and receipts
            for all resources bought on your account.
          </p>
        </div>

        <Link to="/resources">
          Buy More Resources
          <FiArrowRight />
        </Link>
      </div>

      <div className="receipts-summary-row">
        <div className="receipts-summary-card">
          <FiFileText />

          <div>
            <span>{receipts.length}</span>
            <p>Total receipts</p>
          </div>
        </div>

        <div className="receipts-summary-card">
          <FiCreditCard />

          <div>
            <span>KSh {totalSpent.toLocaleString()}</span>
            <p>Total spent</p>
          </div>
        </div>

        <div className="receipts-summary-card">
          <FiCheckCircle />

          <div>
            <span>Paid</span>
            <p>All orders completed</p>
          </div>
        </div>
      </div>

      <div className="receipts-panel">
        <div className="receipts-panel-header">
          <div>
            <span>Transaction Records</span>
            <h2>Recent receipts</h2>
          </div>

          <label className="receipts-search">
            <FiSearch />
            <input type="search" placeholder="Search receipt..." />
          </label>
        </div>

        <div className="receipts-table">
          <div className="receipts-table-head">
            <span>Receipt</span>
            <span>Resource</span>
            <span>Date</span>
            <span>Method</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {receipts.map((receipt) => (
            <article className="receipts-row" key={receipt.id}>
              <div className="receipt-id-block">
                <strong>{receipt.id}</strong>
                <small>SkillVault receipt</small>
              </div>

              <div className="receipt-resource">
                <img src={receipt.resource.image} alt={receipt.resource.title} />

                <div>
                  <strong>{receipt.resource.title}</strong>
                  <small>
                    {receipt.resource.category} / {receipt.resource.type}
                  </small>
                </div>
              </div>

              <span>{receipt.date}</span>

              <span>{receipt.method}</span>

              <strong>KSh {receipt.amount.toLocaleString()}</strong>

              <span className="receipt-status">
                <FiCheckCircle />
                {receipt.status}
              </span>

              <div className="receipt-actions">
                <Link to={`/product/${receipt.resource.slug}`}>
                  <FiEye />
                  View
                </Link>

                <button type="button">
                  <FiDownload />
                  Receipt
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="receipts-note">
        <div>
          <span>Note</span>

          <h2>Receipt downloads are demo actions for now</h2>

          <p>
            Later, this button can generate a proper PDF receipt with customer
            details, transaction ID, tax details, and SkillVault branding.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Receipts;