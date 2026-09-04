import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConsoleShell from "../../components/admin/AdminConsoleShell";
import api from "../../utils/axios";
import "../../styles/gopal.css";

const customerActions = [
  { label: "All Customers", helper: "Browse every registered customer account.", path: "/admin/customers/all", eyebrow: "Accounts" },
  { label: "Add Customer", helper: "Create a new customer record manually.", path: "/admin/customers/add", eyebrow: "Create" },
  { label: "Analytics", helper: "Review the customer analytics summary.", path: "/admin/customers/analytics", eyebrow: "Insights" },
  { label: "Blocked Customers", helper: "Audit blocked and restricted users.", path: "/admin/customers/blocked", eyebrow: "Risk" },
  { label: "Search Customer", helper: "Find a user account quickly by query.", path: "/admin/customers/search", eyebrow: "Search" }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    blockedCustomers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/customer/analytics");
        setStats({
          totalCustomers: Number(res.data?.data?.totalCustomers || 0),
          activeCustomers: Number(res.data?.data?.activeCustomers || 0),
          blockedCustomers: Number(res.data?.data?.blockedCustomers || 0)
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
      activeKey="customers"
      title="Customer Dashboard"
      description="Oversee registered customers, account health, restrictions, and discovery workflows from one customer operations workspace."
      badge="Customer Ops"
      secondaryAction={{ label: "Admin Dashboard", path: "/admin/dashboard" }}
      primaryAction={{ label: "All Customers", path: "/admin/customers/all" }}
    >
      {loading ? (
        <LoadingSpinner centered label="Loading customer dashboard..." />
      ) : (
        <>
          <div className="summary-grid vendor-summary-grid">
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Total Customers</div>
              <div className="summary-value">{stats.totalCustomers}</div>
              <div className="dashboard-stat-card__subtext">Registered user accounts</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Active Customers</div>
              <div className="summary-value">{stats.activeCustomers}</div>
              <div className="dashboard-stat-card__subtext">Accounts in good standing</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Blocked Customers</div>
              <div className="summary-value">{stats.blockedCustomers}</div>
              <div className="dashboard-stat-card__subtext">Accounts requiring review</div>
            </div>
          </div>

          <div className="dashboard-premium-grid">
            <section className="glass-card stack-card dashboard-premium-grid__main">
              <div className="vendor-section-head">
                <div>
                  <h2 className="section-title">Customer Operations</h2>
                  <p>Choose the customer management workflow you want next.</p>
                </div>
              </div>

              <div className="vendor-action-grid dashboard-card-grid">
                {customerActions.map((item) => (
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
                <span className="dashboard-callout__label">Account Health</span>
                <strong>{stats.blockedCustomers > 0 ? "Some accounts need review" : "Customer health is stable"}</strong>
                <p>Blocked accounts are a quick signal for fraud, policy, or support follow-up.</p>
              </div>

              <div className="vendor-stat-list" style={{ marginTop: "20px" }}>
                <div>
                  <span>Active Ratio</span>
                  <strong>
                    {stats.totalCustomers
                      ? `${Math.round((stats.activeCustomers / stats.totalCustomers) * 100)}%`
                      : "0%"}
                  </strong>
                </div>
                <div>
                  <span>Blocked Ratio</span>
                  <strong>
                    {stats.totalCustomers
                      ? `${Math.round((stats.blockedCustomers / stats.totalCustomers) * 100)}%`
                      : "0%"}
                  </strong>
                </div>
                <div>
                  <span>Recommended Next Step</span>
                  <strong>{stats.blockedCustomers > 0 ? "Audit blocked list" : "Explore analytics"}</strong>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </AdminConsoleShell>
  );
}
