import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConsoleShell from "../../components/admin/AdminConsoleShell";
import api from "../../utils/axios";
import "../../styles/gopal.css";

export default function CustomerAnalytics() {
  const [data, setData] = useState({
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
        setData({
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
      title="Customer Analytics"
      description="Review customer growth, account health, and support risk through a cleaner premium analytics view."
      badge="Customer Insights"
      secondaryAction={{ label: "Customer Dashboard", path: "/admin/customers" }}
      primaryAction={{ label: "All Customers", path: "/admin/customers/all" }}
    >
      {loading ? (
        <LoadingSpinner centered label="Loading customer analytics..." />
      ) : (
        <>
          <div className="summary-grid vendor-summary-grid">
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Total Customers</div>
              <div className="summary-value">{data.totalCustomers}</div>
              <div className="dashboard-stat-card__subtext">Customer accounts in the platform</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Active</div>
              <div className="summary-value">{data.activeCustomers}</div>
              <div className="dashboard-stat-card__subtext">Accounts currently in good standing</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Blocked</div>
              <div className="summary-value">{data.blockedCustomers}</div>
              <div className="dashboard-stat-card__subtext">Accounts needing policy or support review</div>
            </div>
          </div>

          <div className="dashboard-premium-grid">
            <section className="glass-card stack-card dashboard-premium-grid__main">
              <div className="dashboard-callout">
                <span className="dashboard-callout__label">Customer Health</span>
                <strong>
                  {data.blockedCustomers > 0 ? "Blocked accounts need attention" : "Customer base looks healthy"}
                </strong>
                <p>Use the blocked and search workflows to investigate suspicious or support-heavy accounts quickly.</p>
              </div>
            </section>

            <aside className="glass-card stack-card dashboard-premium-grid__side">
              <div className="vendor-stat-list">
                <div>
                  <span>Active Ratio</span>
                  <strong>
                    {data.totalCustomers
                      ? `${Math.round((data.activeCustomers / data.totalCustomers) * 100)}%`
                      : "0%"}
                  </strong>
                </div>
                <div>
                  <span>Blocked Ratio</span>
                  <strong>
                    {data.totalCustomers
                      ? `${Math.round((data.blockedCustomers / data.totalCustomers) * 100)}%`
                      : "0%"}
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
