import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConsoleShell from "../../components/admin/AdminConsoleShell";
import api from "../../utils/axios";
import "../../styles/gopal.css";

const vendorActions = [
  { label: "All Vendors", helper: "Browse every registered vendor account.", path: "/admin/vendors/all", eyebrow: "Partners" },
  { label: "Add Vendor", helper: "Create a vendor account manually.", path: "/admin/vendors/add", eyebrow: "Create" },
  { label: "Vendor Approval", helper: "Review new vendor applications.", path: "/admin/vendor-approval", eyebrow: "Approval" },
  { label: "Vendor Analytics", helper: "Open summary analytics for vendors.", path: "/admin/vendors/analytics", eyebrow: "Insights" },
  { label: "Search Vendor", helper: "Find a specific vendor account quickly.", path: "/admin/vendors/search", eyebrow: "Search" },
  { label: "Blocked Vendors", helper: "Audit blocked vendor accounts.", path: "/admin/vendors/blocked", eyebrow: "Risk" }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
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
        setStats({
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
      title="Vendor Dashboard"
      description="Manage marketplace partners, approvals, blocked accounts, and vendor growth from one premium partner workspace."
      badge="Vendor Ops"
      secondaryAction={{ label: "Admin Dashboard", path: "/admin/dashboard" }}
      primaryAction={{ label: "All Vendors", path: "/admin/vendors/all" }}
    >
      {loading ? (
        <LoadingSpinner centered label="Loading vendor dashboard..." />
      ) : (
        <>
          <div className="summary-grid vendor-summary-grid">
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Total Vendors</div>
              <div className="summary-value">{stats.totalVendors}</div>
              <div className="dashboard-stat-card__subtext">All vendor accounts onboarded</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Approved</div>
              <div className="summary-value">{stats.approved}</div>
              <div className="dashboard-stat-card__subtext">Vendors currently active</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Pending</div>
              <div className="summary-value">{stats.pending}</div>
              <div className="dashboard-stat-card__subtext">Applications waiting for review</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Blocked</div>
              <div className="summary-value">{stats.blocked}</div>
              <div className="dashboard-stat-card__subtext">Accounts under restriction</div>
            </div>
          </div>

          <div className="dashboard-premium-grid">
            <section className="glass-card stack-card dashboard-premium-grid__main">
              <div className="vendor-section-head">
                <div>
                  <h2 className="section-title">Vendor Operations</h2>
                  <p>Access the vendor workflows that keep partner management moving smoothly.</p>
                </div>
              </div>

              <div className="vendor-action-grid dashboard-card-grid">
                {vendorActions.map((item) => (
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
                <span className="dashboard-callout__label">Approval Signal</span>
                <strong>{stats.pending > 0 ? `${stats.pending} vendors await approval` : "No pending vendor approvals"}</strong>
                <p>Approval speed directly affects how fast the catalog expands on the platform.</p>
              </div>

              <div className="vendor-stat-list" style={{ marginTop: "20px" }}>
                <div>
                  <span>Approval Rate</span>
                  <strong>
                    {stats.totalVendors
                      ? `${Math.round((stats.approved / stats.totalVendors) * 100)}%`
                      : "0%"}
                  </strong>
                </div>
                <div>
                  <span>Blocked Ratio</span>
                  <strong>
                    {stats.totalVendors
                      ? `${Math.round((stats.blocked / stats.totalVendors) * 100)}%`
                      : "0%"}
                  </strong>
                </div>
                <div>
                  <span>Recommended Next Step</span>
                  <strong>{stats.pending > 0 ? "Review approvals" : "Open analytics"}</strong>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </AdminConsoleShell>
  );
}
