import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConsoleShell from "../../components/admin/AdminConsoleShell";
import api from "../../utils/axios";
import "../../styles/gopal.css";

export default function ProductAnalytics() {
  const [data, setData] = useState({
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
        setData({
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
      title="Product Analytics"
      description="Track catalog size, stock pressure, and top-selling performance in the same polished dashboard system."
      badge="Product Insights"
      secondaryAction={{ label: "Product Dashboard", path: "/admin/productDashboard" }}
      primaryAction={{ label: "All Products", path: "/admin/products/all" }}
    >
      {loading ? (
        <LoadingSpinner centered label="Loading product analytics..." />
      ) : (
        <>
          <div className="summary-grid vendor-summary-grid">
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Total Products</div>
              <div className="summary-value">{data.totalProducts}</div>
              <div className="dashboard-stat-card__subtext">Total listings in the catalog</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Low Stock</div>
              <div className="summary-value">{data.lowStock}</div>
              <div className="dashboard-stat-card__subtext">Listings needing replenishment soon</div>
            </div>
            <div className="summary-tile dashboard-stat-card">
              <div className="summary-label">Top Seller</div>
              <div className="summary-value dashboard-stat-card__value-sm">
                {data.topSelling?.product_name || "None"}
              </div>
              <div className="dashboard-stat-card__subtext">Best performer by sold count</div>
            </div>
          </div>

          <div className="dashboard-premium-grid">
            <section className="glass-card stack-card dashboard-premium-grid__main">
              <div className="dashboard-callout">
                <span className="dashboard-callout__label">Catalog Signal</span>
                <strong>
                  {data.lowStock > 0 ? `${data.lowStock} products are at low stock` : "Stock levels look stable"}
                </strong>
                <p>Use low-stock and top-selling workflows together to protect demand on your best-performing items.</p>
              </div>
            </section>

            <aside className="glass-card stack-card dashboard-premium-grid__side">
              <div className="vendor-stat-list">
                <div>
                  <span>Low Stock Ratio</span>
                  <strong>
                    {data.totalProducts ? `${Math.round((data.lowStock / data.totalProducts) * 100)}%` : "0%"}
                  </strong>
                </div>
                <div>
                  <span>Top Seller</span>
                  <strong>{data.topSelling?.product_name || "Pending"}</strong>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </AdminConsoleShell>
  );
}
