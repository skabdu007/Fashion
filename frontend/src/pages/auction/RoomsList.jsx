import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/axios";

export default function RoomsList() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await api.get("/auction/rooms");
        setRooms(res.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  return (
    <div className="shop-shell">
      <div className="shop-container">
        <div className="glass-card stack-card">
          <div className="auction-card-heading">
            <div>
              <h2>All Auction Rooms</h2>
              <p className="line-item-meta">Review room code, status, queue size, and move into hosting or winner pages.</p>
            </div>
            <button className="btn-modern" onClick={() => navigate("/admin/auction/limit")}>
              New Auction
            </button>
          </div>

          {loading ? (
            <div className="info-banner">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="empty-state">No auction rooms created yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Room Code</th>
                  <th>Status</th>
                  <th>Current Product</th>
                  <th>Products</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room._id}>
                    <td>{room.room_code}</td>
                    <td>{room.status}</td>
                    <td>{room.product_name}</td>
                    <td>{room.total_products}</td>
                    <td>
                      {room.status === "UPCOMING" ? (
                        <button className="btn-secondary-modern" onClick={() => navigate("/admin/hosting-manager")}>
                          Host
                        </button>
                      ) : room.status === "LIVE" ? (
                        <button className="btn-secondary-modern" onClick={() => navigate(`/admin/live-auction/${room.auction_id}`)}>
                          Live
                        </button>
                      ) : (
                        <button className="btn-secondary-modern" onClick={() => navigate(`/auction/winner/${room.auction_id}`)}>
                          Winners
                        </button>
                      )}
                    </td>
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
