import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";
import { getStoredUser, getUserId } from "../../utils/session";

const getStoredCart = () => {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
};

export default function Payment() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useMemo(() => getStoredUser(), []);
  const userId = getUserId(user);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const cartItems = useMemo(() => getStoredCart(), []);
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [cartItems]
  );
  const hasEnoughWallet = walletBalance >= cartTotal && cartTotal > 0;

  useEffect(() => {
    const loadWallet = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/wallet/${userId}`);
        setWalletBalance(Number(res.data.data?.cash_balance || 0));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadWallet();
  }, [userId]);

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container">
        <div className="glass-card stack-card" style={{ maxWidth: "860px", margin: "40px auto" }}>
          <h1 style={{ textAlign: "left", marginBottom: "8px" }}>Payment Method</h1>
          <p style={{ color: "#64748b", marginBottom: "22px" }}>
            Wallet balance is now checked directly before order placement. Choose the faster wallet flow or top up before checkout.
          </p>

          {loading ? (
            <LoadingSpinner centered label="Loading payment summary..." />
          ) : (
            <>
              <div className="summary-grid" style={{ marginBottom: "22px" }}>
                <div className="summary-tile">
                  <div className="summary-label">Cart Total</div>
                  <div className="summary-value">Rs. {cartTotal.toLocaleString()}</div>
                </div>
                <div className="summary-tile">
                  <div className="summary-label">Wallet Balance</div>
                  <div className="summary-value">Rs. {walletBalance.toLocaleString()}</div>
                </div>
              </div>

              <div className="status-panel">
                <div className="summary-tile">
                  <div className="line-item-title">Wallet Payment</div>
                  <div className="line-item-meta">
                    Best option for this app. Your current wallet balance is checked and deducted during order placement.
                  </div>
                  <div className="cta-row">
                    <button className="btn-modern hover-scale" onClick={() => navigate("/orders/checkout")}>
                      Continue with Wallet
                    </button>
                  </div>
                </div>

                <div className="summary-tile" style={{ opacity: 0.85 }}>
                  <div className="line-item-title">UPI / Card</div>
                  <div className="line-item-meta">
                    UI prepared for future expansion. For now, wallet is the active payment route in checkout.
                  </div>
                </div>

                {hasEnoughWallet ? (
                  <div className="success-banner">
                    Your wallet already has enough balance for this cart. You can place the order directly.
                  </div>
                ) : (
                  <div className="warning-banner">
                    Wallet balance is not enough for this cart total. Add money first, then place the order.
                  </div>
                )}
              </div>

              <div className="cta-row">
                <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/wallet/add-money")}>
                  Add Wallet Funds
                </button>
                <button
                  className="btn-secondary-modern hover-scale"
                  onClick={() => {
                    toast.info("Redirecting to secure checkout.");
                    navigate("/orders/checkout");
                  }}
                >
                  Back to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
