import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import api from "../../utils/axios";

export default function WinnerList() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/winner/list");
        setWinners(res.data.winners || []);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load winner list.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container">
        <div className="glass-card stack-card">
          <div className="auction-card-heading">
            <div>
              <h2>Winners</h2>
              <p className="line-item-meta">Product name, winner name, winner nickname, and final price in table format.</p>
            </div>
            <span>{winners.length}</span>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

          {loading ? (
            <LoadingSpinner centered label="Loading winners..." />
          ) : winners.length === 0 ? (
            <div className="empty-state">No winners declared yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Product Name</th>
                  <th>Winner Name</th>
                  <th>Winner Nickname</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((winner, index) => (
                  <tr key={winner._id}>
                    <td>{index + 1}</td>
                    <td>{winner.product_name || winner.product_id?.product_name || "Auction Product"}</td>
                    <td>{winner.winner_name || winner.user_id?.username || "No winner"}</td>
                    <td>{winner.winner_nickname || winner.user_id?.nickname || "-"}</td>
                    <td>Rs. {Number(winner.winning_bid || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
