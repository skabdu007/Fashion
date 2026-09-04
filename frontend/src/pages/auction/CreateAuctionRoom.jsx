import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuctionFlow } from "../../context/AuctionFlowContext";
import { createAuctionRoom, getAuctionProducts } from "../../services/auctionService";

const formatDateTimeValue = (value) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function CreateAuctionRoom() {
  const navigate = useNavigate();
  const { flow, clearFlow } = useAuctionFlow();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [form, setForm] = useState({
    min_bid: "",
    bid_increment: "100",
    turn_time_seconds: "60",
    start_time: "",
    end_time: ""
  });

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const selectedCount = Number(flow.productLimit || 0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const availableProducts = await getAuctionProducts();
        setProducts(availableProducts);
      } catch (err) {
        console.error("Product load error", err);
        setError("Unable to load products for the auction room.");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const selectedProducts = useMemo(
    () => {
      if (flow.createdProducts?.length) {
        return flow.createdProducts;
      }

      return products.filter((product) => flow.selectedProducts.includes(product._id));
    },
    [flow.createdProducts, flow.selectedProducts, products]
  );

  if (!user || user.role !== "SUPER_ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedCount) {
      setError("Choose the room product limit first.");
      return;
    }

    if (selectedProducts.length !== selectedCount) {
      setError(`Select exactly ${selectedCount} products before creating the room.`);
      return;
    }

    if (form.start_time && form.end_time && new Date(form.end_time) <= new Date(form.start_time)) {
      setError("End time must be later than start time.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        product_count: selectedCount,
        product_ids: selectedProducts.map((product) => product._id),
        min_bid: Number(form.min_bid),
        bid_increment: Number(form.bid_increment),
        turn_time_seconds: Number(form.turn_time_seconds),
        start_time: form.start_time,
        end_time: form.end_time
      };

      const res = await createAuctionRoom(payload);
      clearFlow();

      navigate("/admin/hosting", {
        state: {
          auction_id: res.auction_id,
          room_code: res.room_code,
          selected_products: selectedProducts,
          product_count: selectedCount,
          start_time: form.start_time,
          end_time: form.end_time,
          turn_time_seconds: Number(form.turn_time_seconds)
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create the auction room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-shell auction-create-shell">
      <div className="shop-container">
        <div className="glass-card stack-card auction-create-card">
          <div className="auction-create-header">
            <div>
              <div className="premium-badge" style={{ marginBottom: "14px" }}>Shadow Monarch Setup</div>
              <h2>Create Auction Room</h2>
              <p>
                This step only schedules the room and pricing. Product count and selected product ids are already locked
                from the previous auction flow steps.
              </p>
            </div>
            <div className="auction-create-limit">
              <span>Room Limit</span>
              <strong>{selectedCount}</strong>
            </div>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

          <form onSubmit={handleSubmit} className="status-panel">
            <div className="auction-create-grid">
              <div className="glass-card auction-create-panel">
                <label>Selected Room Size</label>
                <input type="text" value={`${selectedCount} products`} readOnly />
                <p className="line-item-meta">Need changes? Go back to the product limit or product selection step.</p>

                <label>Minimum Bid</label>
                <input
                  type="number"
                  name="min_bid"
                  placeholder="Minimum Bid"
                  value={form.min_bid}
                  onChange={handleChange}
                  required
                />

                <label>Bid Increment</label>
                <input
                  type="number"
                  name="bid_increment"
                  placeholder="Bid Increment"
                  value={form.bid_increment}
                  onChange={handleChange}
                  required
                />

                <label>Timer Per Product</label>
                <input
                  type="number"
                  name="turn_time_seconds"
                  placeholder="Timer Per Product (seconds)"
                  min="15"
                  value={form.turn_time_seconds}
                  onChange={handleChange}
                  required
                />

                <label>Room Start Date and Time</label>
                <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange} step="60" />

                <label>Room End Date and Time</label>
                <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} step="60" />
                <p className="line-item-meta">
                  Use the calendar and time picker together. Browser may show 24-hour or AM/PM based on your system locale.
                </p>
              </div>

              <div className="glass-card auction-create-panel">
                <div className="auction-card-heading">
                  <h3>Locked Product Queue</h3>
                  <span>{selectedProducts.length}/{selectedCount}</span>
                </div>

                {loadingProducts ? (
                  <div className="info-banner">Loading product list...</div>
                ) : (
                  <div className="auction-product-selector">
                    {selectedProducts.map((product) => (
                      <div key={product._id} className="line-item auction-product-option is-selected">
                        <div>
                          <div className="line-item-title">{product.product_name}</div>
                          <div className="line-item-meta">
                            Rs. {Number(product.price || 0).toLocaleString()} | Locked for this room
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card auction-create-preview">
              <div className="auction-card-heading">
                <h3>Queue Preview</h3>
                <span>{selectedProducts.length} ready</span>
              </div>

              {selectedProducts.length ? (
                <div className="auction-preview-list">
                  {selectedProducts.map((product, index) => (
                    <div key={product._id} className="line-item">
                      <div>
                        <div className="line-item-title">{index + 1}. {product.product_name}</div>
                        <div className="line-item-meta">Base price Rs. {Number(product.price || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No selected products available. Return to product selection.</div>
              )}

              <div className="auction-create-meta">
                <div className="summary-tile">
                  <div className="summary-label">Scheduled Start</div>
                  <div className="summary-value auction-compact-value">
                    {formatDateTimeValue(form.start_time) || "Not set"}
                  </div>
                </div>
                <div className="summary-tile">
                  <div className="summary-label">Scheduled End</div>
                  <div className="summary-value auction-compact-value">
                    {formatDateTimeValue(form.end_time) || "Not set"}
                  </div>
                </div>
              </div>
            </div>

            <div className="cta-row">
              <button type="button" className="btn-secondary-modern" onClick={() => navigate("/admin/auction/add-product")}>
                Back
              </button>
              <button type="submit" className="btn-modern" disabled={loading || loadingProducts}>
                {loading ? "Creating..." : "Create Auction Room"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
