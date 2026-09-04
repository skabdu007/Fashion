import { useEffect, useMemo, useState } from "react";
import api from "../../utils/axios";
import { getStoredUser, getUserId } from "../../utils/session";
import { normalizeWallet } from "../../utils/wallet";
import "../../styles/gopal.css";

export default function WalletBalance() {
  const user = useMemo(() => getStoredUser(), []);
  const userId = getUserId(user);
  const [wallet, setWallet] = useState(normalizeWallet(null));
  const [error, setError] = useState(userId ? "" : "Please login to view your wallet.");

  useEffect(() => {
    if (!userId) {
      return;
    }

    const fetchWallet = async () => {
      try {
        console.log("[wallet-ui] wallet balance request", { userId });
        const res = await api.get(`/wallet/${userId}`);
        console.log("[wallet-ui] wallet balance response", res.data);
        setWallet(normalizeWallet(res.data.data));
        setError("");
      } catch (error) {
        console.error("[wallet-ui] wallet balance error", error);
        setError(error.response?.data?.message || "Unable to load wallet balance.");
      }
    };

    fetchWallet();
  }, [userId]);

  return (
    <div className="wallet-container">
      <div className="wallet-card">
        <h2>Wallet</h2>

        {error ? <div className="error-banner" style={{ marginBottom: "16px" }}>{error}</div> : null}

        <div className="info-banner" style={{ marginBottom: "16px" }}>
          Cash balance: Rs. {wallet.cash_balance.toLocaleString()}
        </div>

        <div className="success-banner" style={{ marginBottom: "16px" }}>
          Total chips: {wallet.total_chips.toLocaleString()} | Total wallet value: Rs. {wallet.total_wallet_value.toLocaleString()}
        </div>

        <div className="wallet-chips">
          <div className="chip silver">
            <h3>Blue</h3>
            <p>{wallet.blue_chips}</p>
          </div>

          <div className="chip gold">
            <h3>Green</h3>
            <p>{wallet.green_chips}</p>
          </div>

          <div className="chip platinum">
            <h3>Yellow</h3>
            <p>{wallet.yellow_chips}</p>
          </div>

          <div className="chip">
            <h3>Red</h3>
            <p>{wallet.red_chips}</p>
          </div>

          <div className="chip dark-box">
            <h3>Black</h3>
            <p>{wallet.black_chips}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
