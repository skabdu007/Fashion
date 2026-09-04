import { useLocation, useNavigate } from "react-router-dom";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order || null;
  const walletBalance = location.state?.wallet_balance;

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container">
        <div className="glass-card stack-card" style={{ maxWidth: "760px", margin: "40px auto" }}>
          <div className="success-hero">
            <div className="status-illustration status-illustration-success">
              <span className="status-checkmark" />
            </div>

            <div className="success-banner" style={{ marginBottom: "4px" }}>
              Your order was placed successfully and your wallet was updated.
            </div>
          </div>

          <h1 style={{ textAlign: "left", marginBottom: "8px" }}>Order Confirmed</h1>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            Everything completed successfully. You can track the order status from your orders page.
          </p>

          <div className="summary-grid">
            <div className="summary-tile">
              <div className="summary-label">Order ID</div>
              <div className="summary-value" style={{ fontSize: "20px" }}>
                {order?._id ? `#${order._id.slice(-8)}` : "Confirmed"}
              </div>
            </div>

            <div className="summary-tile">
              <div className="summary-label">Amount paid</div>
              <div className="summary-value" style={{ fontSize: "20px" }}>
                Rs. {Number(order?.total_amount || 0).toLocaleString()}
              </div>
            </div>

            <div className="summary-tile">
              <div className="summary-label">Wallet balance</div>
              <div className="summary-value" style={{ fontSize: "20px" }}>
                Rs. {Number(walletBalance || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="cta-row">
            <button className="btn-modern hover-scale" onClick={() => navigate("/orders")}>
              View Orders
            </button>
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
