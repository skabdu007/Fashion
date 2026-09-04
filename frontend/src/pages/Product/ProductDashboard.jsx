import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConsoleShell from "../../components/admin/AdminConsoleShell";
import api from "../../utils/axios";
import "../../styles/gopal.css";

const productActions = [
  { label: "Add Product", helper: "Create a new product listing.", path: "/admin/products/add", eyebrow: "Create" },
  { label: "All Products", helper: "Browse the full catalog list.", path: "/admin/products/all", eyebrow: "Catalog" },
  { label: "Top Selling", helper: "Check the highest selling items.", path: "/admin/products/top-selling", eyebrow: "Performance" },
  { label: "Top Rated", helper: "Review best-rated customer favorites.", path: "/admin/products/top-rated", eyebrow: "Reputation" },
  { label: "Low Stock", helper: "Catch products that need replenishment.", path: "/admin/products/low-stock", eyebrow: "Recovery" },
  { label: "Analytics", helper: "Open product stats and summary views.", path: "/admin/products/analytics", eyebrow: "Insights" }
];

export default function ProductDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    lowStock: 0,
    topSelling: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/product/analytics");
        setAnalytics({
          totalProducts: Number(res.data?.data?.totalProducts || 0),
          lowStock: Number(res.data?.data?.lowStock || 0),
          topSelling: res.data?.data?.topSelling || null
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
      activeKey="products"
      title="Product Dashboard"
      description="Shape the storefront experience, protect stock health, and monitor what is selling or being loved the most."
      badge="Catalog Ops"
      secondaryAction={{ label: "Categories", path: "/admin/category" }}
      primaryAction={{ label: "Add Product", path: "/admin/products/add" }}
    >
      {loading ? (
        <LoadingSpinner centered label="Loading product dashboard..." />
      ) : (
        <>
          <div className="summary-grid vendor-summary-grid">
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Total Products</div>
              <div className="summary-value">{analytics.totalProducts}</div>
              <div className="dashboard-stat-card__subtext">Catalog size right now</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Low Stock</div>
              <div className="summary-value">{analytics.lowStock}</div>
              <div className="dashboard-stat-card__subtext">Listings that need action</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Top Seller</div>
              <div className="summary-value dashboard-stat-card__value-sm">
                {analytics.topSelling?.product_name || "None"}
              </div>
              <div className="dashboard-stat-card__subtext">Best product by sold count</div>
            </div>
          </div>

          <div className="dashboard-premium-grid">
            <section className="glass-card stack-card dashboard-premium-grid__main">
              <div className="vendor-section-head">
                <div>
                  <h2 className="section-title">Catalog Actions</h2>
                  <p>Everything needed to grow, refine, and recover the product catalog.</p>
                </div>
              </div>

              <div className="vendor-action-grid dashboard-card-grid">
                {productActions.map((item) => (
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
                <span className="dashboard-callout__label">Top Seller</span>
                <strong>{analytics.topSelling?.product_name || "No product activity yet"}</strong>
                <p>
                  {analytics.topSelling
                    ? `Sold count: ${analytics.topSelling.sold_count || 0}`
                    : "Once orders start flowing, the best performer will show here."}
                </p>
              </div>

              <div className="vendor-stat-list" style={{ marginTop: "20px" }}>
                <div>
                  <span>Category Hygiene</span>
                  <strong>Managed in Categories</strong>
                </div>
                <div>
                  <span>Stock Risk</span>
                  <strong>{analytics.lowStock} flagged</strong>
                </div>
                <div>
                  <span>Next Best Step</span>
                  <strong>Review low-stock list</strong>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </AdminConsoleShell>
  );
}
