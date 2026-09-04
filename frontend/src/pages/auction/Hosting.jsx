import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";

const formatDateTime = (value) => {
  if (!value) {
    return "Not scheduled";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not scheduled";
  }

  return parsed.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function Hosting() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const data = useMemo(() => {
    if (location.state) {
      localStorage.setItem("auction_hosting", JSON.stringify(location.state));
      return location.state;
    }

    const saved = localStorage.getItem("auction_hosting");
    return saved ? JSON.parse(saved) : {};
  }, [location.state]);

  const auctionId = data?.auction_id;
  const roomCode = data?.room_code;
  const selectedProducts = data?.selected_products || [];

  const startAuction = async () => {
    await api.post("/hosting/start", { auction_id: auctionId });
    toast.success("Auction started successfully.");
    navigate(`/admin/live-auction/${auctionId}`);
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/auction/join`;
    await navigator.clipboard.writeText(link);
    toast.success(`Join link copied. Room code: ${roomCode}`);
  };

  return (
    <div className="shop-shell">
      <div className="shop-container auction-hosting-shell">
        <section className="glass-card auction-hosting-hero">
          <div>
            <div className="premium-badge" style={{ marginBottom: "14px" }}>Hosting Room</div>
            <h2>Room {roomCode}</h2>
            <p>
              This room is prepared as a single live auction space. Products will run one by one in this same room,
              and customers will only see nicknames during bidding.
            </p>
          </div>

          <div className="auction-topbar-actions">
            <button className="btn-secondary-modern" onClick={copyLink}>Copy Join Link</button>
            <button className="btn-modern" onClick={startAuction}>Start Auction</button>
          </div>
        </section>

        <section className="auction-hosting-grid">
          <div className="glass-card auction-hosting-panel">
            <div className="auction-card-heading">
              <h3>Room Details</h3>
              <span>{selectedProducts.length} products</span>
            </div>

            <div className="summary-grid">
              <div className="summary-tile">
                <div className="summary-label">Room Code</div>
                <div className="summary-value auction-compact-value">{roomCode || "Pending"}</div>
              </div>
              <div className="summary-tile">
                <div className="summary-label">Queue Size</div>
                <div className="summary-value">{data?.product_count || selectedProducts.length}</div>
              </div>
              <div className="summary-tile">
                <div className="summary-label">Start Date and Time</div>
                <div className="summary-value auction-compact-value">{formatDateTime(data?.start_time)}</div>
              </div>
              <div className="summary-tile">
                <div className="summary-label">End Date and Time</div>
                <div className="summary-value auction-compact-value">{formatDateTime(data?.end_time)}</div>
              </div>
            </div>

            <div className="info-banner" style={{ marginTop: "18px" }}>
              Timer per product: {Number(data?.turn_time_seconds || 60)} seconds. Every valid bid extends the live timer by 20 seconds.
            </div>
          </div>

          <div className="glass-card auction-hosting-panel">
            <div className="auction-card-heading">
              <h3>Queue Order</h3>
              <span>Locked</span>
            </div>

            {selectedProducts.length ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((product, index) => (
                    <tr key={product._id || `${product.product_name}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{product.product_name}</td>
                      <td>Rs. {Number(product.price || 0).toLocaleString()}</td>
                      <td>{product.stock || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">No queue preview available for this room.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
