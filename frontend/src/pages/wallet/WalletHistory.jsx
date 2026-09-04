import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getWalletHistory } from "../../services/walletService";
import { getStoredUser, getUserId } from "../../utils/session";
import "../../styles/gopal.css";

export default function WalletHistory() {
  const user = useMemo(() => getStoredUser(), []);
  const userId = getUserId(user);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setError("Please login to view wallet history.");
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const historyData = await getWalletHistory(userId);
        setHistory(historyData || []);
        setError("");
      } catch (error) {
        console.error("[wallet-ui] history error", error);
        setError(error.response?.data?.message || "Unable to load wallet history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  return (
    <div className="wallet-container">
      <div className="wallet-card">
        <h2>Wallet History</h2>

        {error ? <div className="error-banner" style={{ marginBottom: "16px" }}>{error}</div> : null}

        {loading ? (
          <LoadingSpinner centered label="Loading transactions..." />
        ) : history.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          <table className="wallet-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={item._id || `${item.createdAt}-${index}`}>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td className={item.type === "CREDIT" ? "text-success" : "text-danger"}>
                    {item.type}
                  </td>
                  <td>{item.category || "SYSTEM"}</td>
                  <td>{Number(item.amount || 0).toLocaleString()}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
