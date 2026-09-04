import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function WinnerPage() {
  const { auction_id } = useParams();
  const [winners, setWinners] = useState([]);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/winner/${auction_id}`);

        if (!active) {
          return;
        }

        setWinners(res.data.winners || []);
        setAuction(res.data.auction || null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError.response?.data?.message || "Unable to load winner details.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [auction_id]);

  if (loading) {
    return <LoadingSpinner centered label="Loading winner details..." />;
  }

  return (
    <div className="shop-shell">
      <div className="shop-container">
        <div className="glass-card stack-card">
          <div className="auction-card-heading">
            <div>
              <h2>Auction Winners</h2>
              <p className="line-item-meta">
                {auction ? `Room ${auction.room_code} | ${auction.status}` : "Winner summary for this room"}
              </p>
            </div>
            <span>{winners.length}</span>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

          {winners.length ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Product Name</th>
                  <th>Winner Name</th>
                  <th>Winner Nickname</th>
                  <th>Result</th>
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
                    <td>{winner.result_type}</td>
                    <td>Rs. {Number(winner.winning_bid || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">{error ? "Winner details are unavailable right now." : "No winner records yet."}</div>
          )}
        </div>
      </div>
    </div>
  );
}
