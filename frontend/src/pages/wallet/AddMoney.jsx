import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import { addMoneyToWallet, getWallet, getWalletHistory } from "../../services/walletService";
import { getDashboardPath, getStoredUser, getUserId } from "../../utils/session";
import { normalizeWallet } from "../../utils/wallet";
import "../../styles/gopal.css";

const QUICK_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function AddMoney() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useMemo(() => getStoredUser(), []);
  const userId = getUserId(user);
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(normalizeWallet(null));
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [recentHistory, setRecentHistory] = useState([]);

  useEffect(() => {
    const loadWallet = async () => {
      if (!userId) {
        setLoadingWallet(false);
        setFormError("Please login first to add wallet money.");
        return;
      }

      try {
        const [walletData, historyData] = await Promise.all([
          getWallet(userId),
          getWalletHistory(userId)
        ]);
        setWallet(normalizeWallet(walletData));
        setRecentHistory(historyData.slice(0, 5));
      } catch (error) {
        console.error(error);
        setFormError(error.response?.data?.message || "Unable to load wallet details.");
      } finally {
        setLoadingWallet(false);
      }
    };

    loadWallet();
  }, [userId]);

  const handleAddMoney = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!userId) {
      setFormError("Please login first to continue.");
      return;
    }

    if (!amount || Number(amount) < 100) {
      setFormError("Minimum add money amount is Rs. 100.");
      return;
    }

    try {
      setLoading(true);
      const walletData = await addMoneyToWallet({
        user_id: userId,
        amount: Number(amount)
      });
      const historyData = await getWalletHistory(userId);
      setWallet(normalizeWallet(walletData));
      setRecentHistory(historyData.slice(0, 5));
      toast.success(`Rs. ${Number(amount).toLocaleString()} added successfully.`);
      setAmount("");
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to add money";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container">
        <div className="glass-card stack-card" style={{ maxWidth: "760px", margin: "32px auto" }}>
          <div className="shop-hero" style={{ marginBottom: "20px" }}>
            <div>
              <h1>Add Wallet Money</h1>
              <p>Top up your wallet, review your available balance, and continue smoothly to checkout or auction.</p>
            </div>

            <button className="btn-secondary-modern hover-scale" onClick={() => navigate(getDashboardPath(user))}>
              Back to Dashboard
            </button>
          </div>

          <InlineAlert message={formError} />

          {loadingWallet ? (
            <LoadingSpinner centered label="Loading wallet details..." />
          ) : (
            <>
              <div className="summary-grid" style={{ marginBottom: "20px" }}>
                <div className="summary-tile">
                  <div className="summary-label">Current Wallet</div>
                  <div className="summary-value">Rs. {Number(wallet?.cash_balance || 0).toLocaleString()}</div>
                </div>
                <div className="summary-tile">
                  <div className="summary-label">Account</div>
                  <div className="summary-value" style={{ fontSize: "18px" }}>
                    {user?.username || user?.email || "Guest"}
                  </div>
                </div>
              </div>

              <div className="cta-row" style={{ marginBottom: "20px" }}>
                {QUICK_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="btn-secondary-modern hover-scale"
                    onClick={() => setAmount(String(value))}
                  >
                    Rs. {value.toLocaleString()}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddMoney} className="status-panel">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />

                <div className="info-banner">
                  Added money will be reflected immediately and used during wallet-based checkout.
                </div>

                <div className="cta-row">
                  <button type="submit" className="btn-modern hover-scale" disabled={loading}>
                    {loading ? "Processing..." : "Add Money"}
                  </button>
                  <button type="button" className="btn-secondary-modern hover-scale" onClick={() => navigate("/orders/checkout")}>
                    Go to Checkout
                  </button>
                </div>
              </form>

              <div className="glass-card" style={{ marginTop: "20px" }}>
                <div className="auction-card-heading">
                  <h3>Recent Wallet History</h3>
                  <button className="btn-secondary-modern" type="button" onClick={() => navigate("/wallet/history")}>
                    Full History
                  </button>
                </div>

                {recentHistory.length ? (
                  <div className="auction-preview-list">
                    {recentHistory.map((item) => (
                      <div key={item._id} className="line-item">
                        <div>
                          <div className="line-item-title">
                            {item.type} | Rs. {Number(item.amount || 0).toLocaleString()}
                          </div>
                          <div className="line-item-meta">
                            {item.description} | {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">Add money history will appear here.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
