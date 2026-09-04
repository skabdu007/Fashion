import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConsoleShell from "../../components/admin/AdminConsoleShell";
import api from "../../utils/axios";
import "../../styles/gopal.css";

const adminActions = [
  { label: "Products", helper: "Manage listings, stock, and analytics.", path: "/admin/productDashboard", eyebrow: "Catalog" },
  { label: "Categories", helper: "Keep fashion grouping polished and consistent.", path: "/admin/category", eyebrow: "Structure" },
  { label: "Customers", helper: "Review account activity and customer health.", path: "/admin/customers", eyebrow: "Accounts" },
  { label: "Vendors", helper: "Track vendor performance and account quality.", path: "/admin/vendors", eyebrow: "Partners" },
  { label: "Orders", helper: "Monitor fulfillment and delivery movement.", path: "/admin/orders-dashboard", eyebrow: "Commerce" },
  { label: "Profile", helper: "Maintain your admin identity and details.", path: "/admin/profile", eyebrow: "Identity" }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    totalVendors: 0,
    pendingVendors: 0,
    totalOrders: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const [productRes, customerRes, vendorRes, orderRes] = await Promise.all([
          api.get("/product/analytics"),
          api.get("/customer/analytics"),
          api.get("/vendor/analytics"),
          api.get("/order/analytics")
        ]);

        setStats({
          totalProducts: Number(productRes.data?.data?.totalProducts || 0),
          lowStock: Number(productRes.data?.data?.lowStock || 0),
          totalCustomers: Number(customerRes.data?.data?.totalCustomers || 0),
          activeCustomers: Number(customerRes.data?.data?.activeCustomers || 0),
          totalVendors: Number(vendorRes.data?.data?.totalVendors || 0),
          pendingVendors: Number(vendorRes.data?.data?.pending || 0),
          totalOrders: Number(orderRes.data?.data?.totalOrders || 0),
          delivered: Number(orderRes.data?.data?.delivered || 0)
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  return (
    <AdminConsoleShell
      activeKey="dashboard"
      title="Admin Dashboard"
      description="Oversee products, customers, vendors, orders, approvals, and premium auction operations from a richer executive workspace."
      badge="System Control"
      secondaryAction={{ label: "Admin Profile", path: "/admin/profile" }}
      primaryAction={{ label: "Back to Home", path: "/" }}
    >
      {loading ? (
        <LoadingSpinner centered label="Loading admin overview..." />
      ) : (
        <>
          <div className="summary-grid vendor-summary-grid">
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Products</div>
              <div className="summary-value">{stats.totalProducts}</div>
              <div className="dashboard-stat-card__subtext">Live catalog inventory</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Customers</div>
              <div className="summary-value">{stats.totalCustomers}</div>
              <div className="dashboard-stat-card__subtext">Registered customer accounts</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Vendors</div>
              <div className="summary-value">{stats.totalVendors}</div>
              <div className="dashboard-stat-card__subtext">Marketplace partners onboarded</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Orders</div>
              <div className="summary-value">{stats.totalOrders}</div>
              <div className="dashboard-stat-card__subtext">Commerce flow across the platform</div>
            </div>
          </div>

          <div className="dashboard-premium-grid">
            <section className="glass-card stack-card dashboard-premium-grid__main">
              <div className="vendor-section-head">
                <div>
                  <h2 className="section-title">Executive Control Center</h2>
                  <p>Jump into the operational areas that need the most attention.</p>
                </div>
              </div>

              <div className="vendor-action-grid dashboard-card-grid">
                {adminActions.map((item) => (
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

                {admin?.role === "SUPER_ADMIN" ? (
                  <button
                    className="dashboard-card vendor-action-card dashboard-card--premium"
                    onClick={() => navigate("/admin/auction-dashboard")}
                  >
                    <span className="dashboard-card__eyebrow">Live Ops</span>
                    <strong>Auction</strong>
                    <span>Control rooms, hosting flow, and live bidding oversight.</span>
                  </button>
                ) : null}
              </div>
            </section>

            <aside className="glass-card stack-card dashboard-premium-grid__side">
              <div className="vendor-section-head">
                <div>
                  <h2 className="section-title">Operational Snapshot</h2>
                  <p>Quick health readout across the marketplace.</p>
                </div>
              </div>

              <div className="vendor-stat-list">
                <div>
                  <span>Low Stock Products</span>
                  <strong>{stats.lowStock}</strong>
                </div>
                <div>
                  <span>Active Customers</span>
                  <strong>{stats.activeCustomers}</strong>
                </div>
                <div>
                  <span>Pending Vendors</span>
                  <strong>{stats.pendingVendors}</strong>
                </div>
                <div>
                  <span>Delivered Orders</span>
                  <strong>{stats.delivered}</strong>
                </div>
              </div>

              <div className="dashboard-callout">
                <span className="dashboard-callout__label">Focus Area</span>
                <strong>Vendor approvals and low-stock recovery</strong>
                <p>These two areas usually impact platform growth and buyer satisfaction the fastest.</p>
              </div>
            </aside>
          </div>

          <div className="dashboard-highlight-grid">
            <article className="vendor-panel-card dashboard-highlight-card">
              <span className="dashboard-highlight-card__tag">Catalog Health</span>
              <h3>Protect the storefront quality</h3>
              <p>Use product and category dashboards to keep inventory complete, attractive, and conversion-ready.</p>
              <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/admin/productDashboard")}>
                Open Product Dashboard
              </button>
            </article>

            <article className="vendor-panel-card dashboard-highlight-card">
              <span className="dashboard-highlight-card__tag">Vendor Governance</span>
              <h3>Keep the supply side strong</h3>
              <p>Pending vendors are waiting for review. Approval velocity directly affects platform growth.</p>
              <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/admin/vendor-approval")}>
                Review Vendors
              </button>
            </article>

            <article className="vendor-panel-card dashboard-highlight-card">
              <span className="dashboard-highlight-card__tag">Order Fulfillment</span>
              <h3>Track delivery performance</h3>
              <p>Monitor order movement and dive into analytics when fulfillment needs attention.</p>
              <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/admin/orders-dashboard")}>
                Open Orders
              </button>
            </article>
          </div>
        </>
      )}
    </AdminConsoleShell>
  );
}
