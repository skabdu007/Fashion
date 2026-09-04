import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConsoleShell from "../../components/admin/AdminConsoleShell";
import api from "../../utils/axios";
import "../../styles/gopal.css";

export default function OrderAnalytics() {
  const [data, setData] = useState({
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
        setData({
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
      title="Order Analytics"
      description="Review order movement, fulfillment health, and cancellation risk in the same premium dashboard language."
      badge="Order Insights"
      secondaryAction={{ label: "Order Dashboard", path: "/admin/orders-dashboard" }}
      primaryAction={{ label: "All Orders", path: "/admin/orders" }}
    >
      {loading ? (
        <LoadingSpinner centered label="Loading order analytics..." />
      ) : (
        <>
          <div className="summary-grid vendor-summary-grid">
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Total Orders</div>
              <div className="summary-value">{data.totalOrders}</div>
              <div className="dashboard-stat-card__subtext">Orders placed across the platform</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Pending</div>
              <div className="summary-value">{data.pending}</div>
              <div className="dashboard-stat-card__subtext">Orders waiting to move forward</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Delivered</div>
              <div className="summary-value">{data.delivered}</div>
              <div className="dashboard-stat-card__subtext">Completed fulfillment successfully</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Cancelled</div>
              <div className="summary-value">{data.cancelled}</div>
              <div className="dashboard-stat-card__subtext">Orders that need recovery analysis</div>
            </div>
          </div>

          <div className="dashboard-premium-grid">
            <section className="glass-card stack-card dashboard-premium-grid__main">
              <div className="dashboard-callout">
                <span className="dashboard-callout__label">Fulfillment Signal</span>
                <strong>
                  {data.pending > data.delivered ? "Pending queue is heavier than delivered flow" : "Delivery flow looks stable"}
                </strong>
                <p>Use this view as a quick checkpoint before drilling into full order tables or cancellations.</p>
              </div>
            </section>

            <aside className="glass-card stack-card dashboard-premium-grid__side">
              <div className="vendor-stat-list">
                <div>
                  <span>Delivery Ratio</span>
                  <strong>
                    {data.totalOrders ? `${Math.round((data.delivered / data.totalOrders) * 100)}%` : "0%"}
                  </strong>
                </div>
                <div>
                  <span>Cancellation Ratio</span>
                  <strong>
                    {data.totalOrders ? `${Math.round((data.cancelled / data.totalOrders) * 100)}%` : "0%"}
                  </strong>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </AdminConsoleShell>
  );
}
