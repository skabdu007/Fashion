import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

const formatDateTime = (value) => {
  if (!value) {
    return "Not set";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not set";
  }

  return parsed.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function HostingManager() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await api.get("/auction/rooms");
        setRooms(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const startAuction = async (id) => {
    await api.post("/hosting/start", { auction_id: id });
    navigate(`/admin/live-auction/${id}`);
  };

  return (
    <div className="shop-shell">
      <div className="shop-container auction-hosting-shell">
        <section className="shop-hero">
          <div>
            <h1>Hosting Manager</h1>
            <p>Start rooms, monitor live progress, and review the full queue with clear date and time details.</p>
          </div>
        </section>

        {loading ? (
          <div className="glass-card stack-card">Loading hosting rooms...</div>
        ) : (
          <div className="auction-hosting-room-grid">
            {rooms.map((room) => (
              <div key={room._id} className="glass-card auction-hosting-room-card">
                <div className="auction-card-heading">
                  <h3>{room.product_name}</h3>
                  <span className={`auction-status-pill auction-status-pill-${String(room.status || "").toLowerCase()}`}>
                    {room.status}
                  </span>
                </div>

                <div className="auction-room-meta">
                  <div><strong>Room Code:</strong> {room.room_code}</div>
                  <div><strong>Products:</strong> {room.total_products}</div>
                  <div><strong>Sold:</strong> {room.sold_products_count}</div>
                  <div><strong>Folded:</strong> {room.folded_bidders_count}</div>
                  <div><strong>Active Bidders:</strong> {room.active_bidders_count}</div>
                  <div><strong>Start:</strong> {formatDateTime(room.start_time)}</div>
                  <div><strong>End:</strong> {formatDateTime(room.end_time)}</div>
                </div>

                <div className="auction-topbar-actions">
                  {room.status === "UPCOMING" && (
                    <button className="btn-modern" onClick={() => startAuction(room.auction_id)}>
                      Start Auction
                    </button>
                  )}

                  {room.status === "LIVE" && (
                    <button className="btn-secondary-modern" onClick={() => navigate(`/admin/live-auction/${room.auction_id}`)}>
                      Monitor Live
                    </button>
                  )}

                  {room.status === "ENDED" && (
                    <button className="btn-secondary-modern" onClick={() => navigate(`/auction/winner/${room.auction_id}`)}>
                      View Winner
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
