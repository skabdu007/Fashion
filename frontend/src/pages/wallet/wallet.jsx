import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import api, { API_BASE_URL } from "../../utils/axios";
import { getProductImageUrl, handleImageError } from "../../utils/image";
import { getStoredUser, getUserId } from "../../utils/session";
import { normalizeWallet } from "../../utils/wallet";
import "../../styles/gopal.css";

export default function Wallet() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useMemo(() => getStoredUser(), []);
  const userId = getUserId(user);
  const [wallet, setWallet] = useState(normalizeWallet(null));
  const [wonProducts, setWonProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const chipOptions = [
    { color: "blue", label: "Blue", amount: 1000, boxClass: "silver-box", buttonClass: "blue" },
    { color: "green", label: "Green", amount: 10000, boxClass: "gold-box", buttonClass: "green" },
    { color: "yellow", label: "Yellow", amount: 50000, boxClass: "platinum-box", buttonClass: "yellow" },
    { color: "red", label: "Red", amount: 100000, boxClass: "danger-box", buttonClass: "red" },
    { color: "black", label: "Black", amount: 500000, boxClass: "dark-box", buttonClass: "black" }
  ];

  const fetchWallet = useCallback(async () => {
    if (!userId) return;

    console.log("[wallet-ui] fetching wallet", { userId });

    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/wallet/${userId}`);
      console.log("[wallet-ui] wallet fetch response", res.data);
      setWallet(normalizeWallet(res.data.data));
      setWonProducts(res.data?.data?.won_products || []);
    } catch (err) {
      console.error("[wallet-ui] wallet fetch error", err);
      setError(err.response?.data?.message || "Failed to load wallet");
      setWonProducts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const buyChips = async (color) => {
    if (!userId) {
      toast.error("User session not found. Please login again.");
      return;
    }

    try {
      setActionLoading(true);
      const selectedChip = chipOptions.find((chip) => chip.color === color);

      if (!selectedChip) {
        toast.error("Invalid chip selection.");
        return;
      }

      if (Number(wallet.cash_balance || 0) < selectedChip.amount) {
        toast.error("Insufficient cash balance. Add money first before buying chips.");
        return;
      }

      const res = await api.post("/wallet/buy-chips", {
        user_id: userId,
        chip_type: color,
        amount: selectedChip.amount
      });

      if (res.data?.data) {
        setWallet(normalizeWallet(res.data.data));
      }

      toast.success(`${selectedChip.label.toUpperCase()} chips purchased successfully.`);
      await fetchWallet();
    } catch (err) {
      console.error("[wallet-ui] buy chips error", err);
      const message = err.response?.data?.message || "Chip purchase failed";
      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-card wallet-card-polished">
        <h2 className="wallet-title">Wallet</h2>

        {error ? <p className="error">{error}</p> : null}

        {loading ? (
          <LoadingSpinner centered label="Loading wallet..." />
        ) : (
          <>
            <div className="summary-grid" style={{ marginBottom: "16px" }}>
              <div className="summary-tile">
                <div className="summary-label">Total Chips</div>
                <div className="summary-value">{wallet.total_chips.toLocaleString()}</div>
              </div>
              <div className="summary-tile">
                <div className="summary-label">Cash Balance</div>
                <div className="summary-value">Rs. {wallet.cash_balance.toLocaleString()}</div>
              </div>
            </div>

            <div className="info-banner" style={{ marginTop: "16px" }}>
              Total wallet value available across cash and chips: Rs. {wallet.total_wallet_value.toLocaleString()}
            </div>

            <div className="success-banner" style={{ marginTop: "16px" }}>
              Flow: Add Money → Buy Chips using cash → Use chips in auction. Direct free chip credit is not allowed.
            </div>

            <div className="wallet-balance">
              {chipOptions.map((chip) => (
                <div key={chip.color} className={`balance-box ${chip.boxClass}`}>
                  <p>{chip.label}</p>
                  <span>{wallet[`${chip.color}_chips`].toLocaleString()}</span>
                </div>
              ))}
            </div>

            <section className="wallet-wins-section">
              <div className="auction-card-heading" style={{ marginTop: "24px" }}>
                <h3 className="section-title" style={{ marginBottom: 0 }}>My Wins</h3>
                <span>{wonProducts.length} items</span>
              </div>

              {wonProducts.length === 0 ? (
                <div className="empty-state">You haven&apos;t won any auctions yet</div>
              ) : (
                <div className="wallet-wins-grid">
                  {wonProducts.map((wonProduct) => {
                    const product = wonProduct.product || {};
                    const imageSrc = getProductImageUrl(product.image);

                    return (
                      <article key={wonProduct._id} className="glass-card wallet-win-card">
                        <img
                          src={imageSrc}
                          alt={product.product_name || "Won product"}
                          className="wallet-win-card__image"
                          onError={handleImageError}
                        />

                        <div className="wallet-win-card__body">
                          <div className="wallet-win-card__top">
                            <h4>{product.product_name || "Won product"}</h4>
                            <span className={`status-badge ${wonProduct.status === "delivered" ? "active" : "upcoming"}`}>
                              {wonProduct.status === "delivered" ? "Delivered" : wonProduct.status === "claimed" ? "Claimed" : "Won"}
                            </span>
                          </div>

                          <p className="line-item-meta">
                            Winning price: Rs. {Number(wonProduct.winning_bid || 0).toLocaleString()}
                          </p>
                          <p className="line-item-meta">
                            Room: {wonProduct.auction?.room_code || "Auction room"}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        <hr />

        <h3 className="section-title">Buy Chips</h3>

        <div className="chip-buttons">
          {chipOptions.map((chip) => (
            <button
              key={chip.color}
              className={`chip-btn ${chip.buttonClass}`}
              disabled={actionLoading || Number(wallet.cash_balance || 0) < chip.amount}
              onClick={() => buyChips(chip.color)}
            >
              {chip.label.toUpperCase()} (Rs. {chip.amount.toLocaleString()})
            </button>
          ))}
        </div>

        <div className="warning-banner" style={{ marginTop: "14px" }}>
          Buying chips deducts the same amount from cash balance. Example: Rs. 10,000 cash becomes 10,000 green chips.
        </div>

        <div className="wallet-actions">
          <button className="btn btn-secondary" onClick={() => navigate("/wallet/history")}>
            View History
          </button>

          <button className="btn btn-primary" onClick={() => navigate("/wallet/add-money")}>
            Add Money
          </button>

          <button className="btn btn-secondary" onClick={() => navigate("/wallet/bank-account")}>
            Bank Account
          </button>
        </div>
      </div>
    </div>
  );
}
