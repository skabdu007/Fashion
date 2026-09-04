import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConsoleShell from "../../components/admin/AdminConsoleShell";
import api from "../../utils/axios";
import "../../styles/gopal.css";

const orderActions = [
  { label: "All Orders", helper: "Open the full order list.", path: "/admin/orders", eyebrow: "Queue" },
  { label: "Order Analytics", helper: "View overall fulfillment analytics.", path: "/admin/orders/analytics", eyebrow: "Insights" },
  { label: "Cancelled Orders", helper: "Review cancelled and refunded orders.", path: "/admin/orders/cancelled", eyebrow: "Recovery" },
  { label: "Vendor Dashboard", helper: "Coordinate with the vendor operations workspace.", path: "/admin/vendors", eyebrow: "Vendor" },
  { label: "Vendor Approval", helper: "Review pending vendor applications tied to growth.", path: "/admin/vendor-approval", eyebrow: "Partner" },
  { label: "Admin Home", helper: "Return to the main admin overview.", path: "/admin/dashboard", eyebrow: "Return" }
];

export default function OrderDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/order/analytics");
        setStats({
          totalOrders: Number(res.data?.data?.totalOrders || 0),
          pending: Number(res.data?.data?.pending || 0),
          delivered: Number(res.data?.data?.delivered || 0),
          cancelled: Number(res.data?.data?.cancelled || 0)
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
      activeKey="orders"
      title="Order Dashboard"
      description="Monitor the commerce pipeline, cancellations, delivery movement, and vendor order operations from one premium order workspace."
      badge="Order Ops"
      secondaryAction={{ label: "Admin Dashboard", path: "/admin/dashboard" }}
      primaryAction={{ label: "Open All Orders", path: "/admin/orders" }}
    >
      {loading ? (
        <LoadingSpinner centered label="Loading order dashboard..." />
      ) : (
        <>
          <div className="summary-grid vendor-summary-grid">
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Total Orders</div>
              <div className="summary-value">{stats.totalOrders}</div>
              <div className="dashboard-stat-card__subtext">All placed orders</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Pending</div>
              <div className="summary-value">{stats.pending}</div>
              <div className="dashboard-stat-card__subtext">Orders waiting to move</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Delivered</div>
              <div className="summary-value">{stats.delivered}</div>
              <div className="dashboard-stat-card__subtext">Completed fulfillment</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Cancelled</div>
              <div className="summary-value">{stats.cancelled}</div>
              <div className="dashboard-stat-card__subtext">Needs recovery follow-up</div>
            </div>
          </div>

          <div className="dashboard-premium-grid">
            <section className="glass-card stack-card dashboard-premium-grid__main">
              <div className="vendor-section-head">
                <div>
                  <h2 className="section-title">Fulfillment Actions</h2>
                  <p>Choose the order operation you want to manage next.</p>
                </div>
              </div>

              <div className="vendor-action-grid dashboard-card-grid">
                {orderActions.map((item) => (
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
                <span className="dashboard-callout__label">Pipeline Signal</span>
                <strong>{stats.pending > stats.delivered ? "Pending load is high" : "Fulfillment is stable"}</strong>
                <p>Use this space as a quick signal before diving into the full order tables and analytics.</p>
              </div>

              <div className="vendor-stat-list" style={{ marginTop: "20px" }}>
                <div>
                  <span>Most Critical Area</span>
                  <strong>{stats.cancelled > 0 ? "Cancelled orders" : "Pending flow"}</strong>
                </div>
                <div>
                  <span>Vendor Collaboration</span>
                  <strong>Available</strong>
                </div>
                <div>
                  <span>Recommended Next Step</span>
                  <strong>Open analytics</strong>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </AdminConsoleShell>
  );
}
