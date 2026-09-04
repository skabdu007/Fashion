import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConsoleShell from "../../components/admin/AdminConsoleShell";
import api from "../../utils/axios";
import "../../styles/gopal.css";

export default function VendorAnalytics() {
  const [data, setData] = useState({
    totalVendors: 0,
    approved: 0,
    blocked: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/vendor/analytics");
        setData({
          totalVendors: Number(res.data?.data?.totalVendors || 0),
          approved: Number(res.data?.data?.approved || 0),
          blocked: Number(res.data?.data?.blocked || 0),
          pending: Number(res.data?.data?.pending || 0)
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
      activeKey="vendors"
      title="Vendor Analytics"
      description="Review partner onboarding, approvals, pending requests, and vendor account health in a premium analytics view."
      badge="Vendor Insights"
      secondaryAction={{ label: "Vendor Dashboard", path: "/admin/vendors" }}
      primaryAction={{ label: "Vendor Approval", path: "/admin/vendor-approval" }}
    >
      {loading ? (
        <LoadingSpinner centered label="Loading vendor analytics..." />
      ) : (
        <>
          <div className="summary-grid vendor-summary-grid">
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Total Vendors</div>
              <div className="summary-value">{data.totalVendors}</div>
              <div className="dashboard-stat-card__subtext">All vendor accounts onboarded</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Approved</div>
              <div className="summary-value">{data.approved}</div>
              <div className="dashboard-stat-card__subtext">Vendors who can actively operate</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Pending</div>
              <div className="summary-value">{data.pending}</div>
              <div className="dashboard-stat-card__subtext">Applications waiting for review</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Blocked</div>
              <div className="summary-value">{data.blocked}</div>
              <div className="dashboard-stat-card__subtext">Accounts under restriction</div>
            </div>
          </div>

          <div className="dashboard-premium-grid">
            <section className="glass-card stack-card dashboard-premium-grid__main">
              <div className="dashboard-callout">
                <span className="dashboard-callout__label">Partner Flow</span>
                <strong>
                  {data.pending > 0 ? `${data.pending} vendors need approval` : "Approval queue is currently clear"}
                </strong>
                <p>Approval response time is one of the fastest levers for improving catalog growth on the platform.</p>
              </div>
            </section>

            <aside className="glass-card stack-card dashboard-premium-grid__side">
              <div className="vendor-stat-list">
                <div>
                  <span>Approval Ratio</span>
                  <strong>
                    {data.totalVendors ? `${Math.round((data.approved / data.totalVendors) * 100)}%` : "0%"}
                  </strong>
                </div>
                <div>
                  <span>Blocked Ratio</span>
                  <strong>
                    {data.totalVendors ? `${Math.round((data.blocked / data.totalVendors) * 100)}%` : "0%"}
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
