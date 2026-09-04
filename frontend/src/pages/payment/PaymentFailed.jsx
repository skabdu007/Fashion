import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container">
        <div className="glass-card stack-card" style={{ maxWidth: "760px", margin: "40px auto" }}>
          <div className="error-hero">
            <div className="status-illustration status-illustration-error">
              <span className="status-cross" />
            </div>

            <div className="error-banner" style={{ marginBottom: "4px" }}>
              We could not complete that request.
            </div>
          </div>

          <h1 style={{ textAlign: "left", marginBottom: "8px" }}>Action Failed</h1>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            Please return to checkout, review your eligibility and wallet balance, and try again.
          </p>

          <div className="cta-row">
            <button className="btn-modern hover-scale" onClick={() => navigate("/orders/checkout")}>
              Back to Checkout
            </button>
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/subscription")}>
              Review Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
