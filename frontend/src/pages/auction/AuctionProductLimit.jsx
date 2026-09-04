import { useNavigate } from "react-router-dom";
import { useAuctionFlow } from "../../context/AuctionFlowContext";

export default function AuctionProductLimit() {
  const navigate = useNavigate();
  const { flow, setProductLimit } = useAuctionFlow();

  const handleContinue = () => {
    if (!flow.productLimit || flow.productLimit < 1) {
      alert("Please enter valid product limit");
      return;
    }

    navigate("/admin/auction/add-product");
  };

  return (
    <div className="shop-shell">
      <div className="shop-container">
        <section className="glass-card premium-panel">
          <div className="premium-badge">Shadow Monarch</div>

          <h1>How many products for this auction?</h1>

          <p>
            Each live room can host products. Enter the room limit first, then we will lock product adding to that number.
          </p>

          <div className="glass-card stack-card" style={{ marginTop: "20px", marginBottom: "20px" }}>
            <label className="section-title" style={{ marginBottom: "10px", display: "block" }}>
              Enter the Limit
            </label>

            <input
              type="number"
              min="1"
              max="50"
              value={flow.productLimit || ""}
              onChange={(event) => setProductLimit(Number(event.target.value))}
              placeholder="Enter any number (e.g. 5, 10, 20, 50)"
            />

            <p className="line-item-meta" style={{ marginTop: "10px" }}>
              Dynamic room limit enabled. You can enter 5, 10, 20, or any value up to 50 for one auction room.
            </p>
          </div>

          <div className="limit-grid">
            {[5, 10, 20, 50].map((value) => (
              <button
                key={value}
                type="button"
                className={`limit-card ${flow.productLimit === value ? "is-active" : ""}`}
                onClick={() => setProductLimit(value)}
              >
                <strong>{value}</strong>
                <span>{value} product queue</span>
              </button>
            ))}
          </div>

          <div className="cta-row">
            <button className="btn-modern" onClick={handleContinue}>
              Continue to Add Products
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
