import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConsoleShell from "../../components/admin/AdminConsoleShell";
import api from "../../utils/axios";
import "../../styles/gopal.css";

const auctionActions = [
  { label: "Create Room", helper: "Start the new room flow and configure the queue.", path: "/admin/auction/limit", eyebrow: "Launch" },
  { label: "Hosting Rooms", helper: "Manage room hosting and active sessions.", path: "/admin/hosting-manager", eyebrow: "Live Ops" },
  { label: "All Rooms", helper: "Browse every created auction room.", path: "/admin/rooms", eyebrow: "Rooms" },
  { label: "Live Monitor", helper: "Watch live bidding across active rooms.", path: "/admin/live-bidding", eyebrow: "Tracking" },
  { label: "Winner List", helper: "Review completed winner declarations.", path: "/admin/winners", eyebrow: "Settlement" },
  { label: "Admin Home", helper: "Return to the admin overview workspace.", path: "/admin/dashboard", eyebrow: "Return" }
];

export default function AuctionDashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const [stats, setStats] = useState({
    totalRooms: 0,
    liveRooms: 0,
    endedRooms: 0
  });
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== "SUPER_ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/auction/rooms");
        const rooms = res.data?.data || [];

        setStats({
          totalRooms: rooms.length,
          liveRooms: rooms.filter((room) => room.status === "LIVE").length,
          endedRooms: rooms.filter((room) => room.status === "ENDED").length
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <AdminConsoleShell
      activeKey="auction"
      title="Auction Dashboard"
      description="Coordinate room creation, hosting, live bidding, and winner tracking from one premium auction command center."
      badge="Auction Command"
      secondaryAction={{ label: "Admin Dashboard", path: "/admin/dashboard" }}
      primaryAction={{ label: "Create Room", path: "/admin/auction/limit" }}
    >
      {loading ? (
        <LoadingSpinner centered label="Loading auction dashboard..." />
      ) : (
        <>
          <div className="summary-grid vendor-summary-grid">
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Total Rooms</div>
              <div className="summary-value">{stats.totalRooms}</div>
              <div className="dashboard-stat-card__subtext">Rooms created across the platform</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Live Auctions</div>
              <div className="summary-value">{stats.liveRooms}</div>
              <div className="dashboard-stat-card__subtext">Active rooms needing monitoring</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Completed</div>
              <div className="summary-value">{stats.endedRooms}</div>
              <div className="dashboard-stat-card__subtext">Closed auctions with outcomes</div>
            </div>
          </div>

          <div className="dashboard-premium-grid">
            <section className="glass-card stack-card dashboard-premium-grid__main">
              <div className="vendor-section-head">
                <div>
                  <h2 className="section-title">Auction Actions</h2>
                  <p>Move between room creation, hosting, monitoring, and settlement with a cleaner flow.</p>
                </div>
              </div>

              <div className="vendor-action-grid dashboard-card-grid">
                {auctionActions.map((item) => (
                  <button
                    key={item.path}
                    className="dashboard-card vendor-action-card dashboard-card--premium"
                    onClick={() => navigate(item.path)}
                  >
                    <span className="dashboard-card__eyebrow">{item.eyebrow}</span>
                    <strong>{item.label}</strong>
                    <span>{item.helper}</span>
                  </button>
                ))}
              </div>
            </section>

            <aside className="glass-card stack-card dashboard-premium-grid__side">
              <div className="dashboard-callout">
                <span className="dashboard-callout__label">Live Signal</span>
                <strong>{stats.liveRooms > 0 ? `${stats.liveRooms} rooms are live` : "No rooms currently live"}</strong>
                <p>Use live monitor and hosting management when active bidding needs immediate attention.</p>
              </div>

              <div className="vendor-stat-list" style={{ marginTop: "20px" }}>
                <div>
                  <span>Room Pipeline</span>
                  <strong>{stats.totalRooms} total</strong>
                </div>
                <div>
                  <span>Closed Auctions</span>
                  <strong>{stats.endedRooms}</strong>
                </div>
                <div>
                  <span>Recommended Next Step</span>
                  <strong>{stats.liveRooms > 0 ? "Open live monitor" : "Create next room"}</strong>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </AdminConsoleShell>
  );
}
