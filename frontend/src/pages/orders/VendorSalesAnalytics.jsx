import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";
import { getStoredUser, getStoredVendor } from "../../utils/session";
import {
  calculateVendorOverview,
  filterVendorOrders,
  filterVendorProducts,
  formatCompactDate,
  getVendorId
} from "../../utils/vendorWorkspace";
import "../../styles/gopal.css";

export default function VendorSalesAnalytics() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useMemo(() => getStoredUser(), []);
  const vendor = useMemo(() => getStoredVendor(), []);
  const vendorId = getVendorId(vendor, user);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!vendorId) return;

      try {
        setLoading(true);
        const [productRes, orderRes] = await Promise.all([
          api.get("/product"),
          api.get("/order/admin/all")
        ]);

        setProducts(productRes.data?.data || []);
        setOrders(orderRes.data?.data || []);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Unable to load vendor analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [toast, vendorId]);

  if (!user || user.role?.toUpperCase() !== "VENDOR") {
    return <Navigate to="/vendor/login" replace />;
  }

  const vendorProducts = useMemo(
    () => filterVendorProducts(products, vendorId),
    [products, vendorId]
  );
  const vendorOrders = useMemo(
    () => filterVendorOrders(orders, vendorProducts),
    [orders, vendorProducts]
  );
  const overview = useMemo(
    () => calculateVendorOverview(vendorProducts, vendorOrders),
    [vendorProducts, vendorOrders]
  );

  const topProducts = useMemo(
    () =>
      [...vendorProducts]
        .sort((left, right) => Number(right?.sold_count || 0) - Number(left?.sold_count || 0))
        .slice(0, 5),
    [vendorProducts]
  );

  const statusBreakdown = useMemo(() => {
    const counts = {
      PENDING: 0,
      PAID: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0
    };

    vendorOrders.forEach((order) => {
      const status = order?.status || "PENDING";
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts);
  }, [vendorOrders]);

  if (loading) {
    return <LoadingSpinner centered label="Loading vendor analytics..." />;
  }

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container vendor-workspace">
        <div className="shop-hero vendor-hero">
          <div>
            <h1>Vendor Sales Analytics</h1>
            <p>Monitor how your catalog is performing across demand, delivery, and revenue without leaving the vendor workspace.</p>
          </div>

          <div className="dashboard-topbar__actions">
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/vendor/dashboard")}>
              Back to Dashboard
            </button>
            <button className="btn-modern hover-scale" onClick={() => navigate("/vendor/inventory")}>
              Open Inventory
            </button>
          </div>
        </div>

        <div className="summary-grid vendor-summary-grid">
          <div className="summary-tile">
            <div className="summary-label">Revenue</div>
            <div className="summary-value">Rs. {Math.round(overview.totalRevenue).toLocaleString()}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Average Order</div>
            <div className="summary-value">Rs. {Math.round(overview.averageOrderValue).toLocaleString()}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Delivered Orders</div>
            <div className="summary-value">{overview.deliveredOrders}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Units Sold</div>
            <div className="summary-value">{overview.totalUnitsSold}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Catalog Views</div>
            <div className="summary-value">{overview.totalViews}</div>
          </div>
        </div>

        <div className="vendor-dashboard-grid">
          <section className="glass-card stack-card vendor-dashboard-grid__main">
            <div className="vendor-section-head">
              <div>
                <h2 className="section-title">Top Performing Products</h2>
                <p>Products ranked by the sales activity currently stored in the catalog.</p>
              </div>
            </div>

            {topProducts.length === 0 ? (
              <div className="empty-state vendor-empty-state">No sales data available yet.</div>
            ) : (
              <div className="vendor-table-shell">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Sold</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product._id}>
                        <td>{product.product_name}</td>
                        <td>{product.category_id?.name || "Uncategorized"}</td>
                        <td>{product.sold_count || 0}</td>
                        <td>{product.stock || 0}</td>
                        <td>{product.status || "ACTIVE"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="glass-card stack-card vendor-dashboard-grid__side">
            <div className="vendor-section-head">
              <div>
                <h2 className="section-title">Order Status Mix</h2>
                <p>How your current order pipeline is distributed.</p>
              </div>
            </div>

            <div className="vendor-status-breakdown">
              {statusBreakdown.map(([status, count]) => (
                <div key={status} className="vendor-status-breakdown__item">
                  <span className={`status ${status}`}>{status}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>

            <div className="vendor-panel-card" style={{ marginTop: "20px" }}>
              <h3>Top Seller</h3>
              <p>{overview.topProduct?.product_name || "No product sales yet"}</p>
              <div className="vendor-line-item">
                <span>Units Sold</span>
                <strong>{overview.topProduct?.sold_count || 0}</strong>
              </div>
              <div className="vendor-line-item">
                <span>Created</span>
                <strong>{formatCompactDate(overview.topProduct?.created_at)}</strong>
              </div>
            </div>

            <div className="vendor-panel-card" style={{ marginTop: "20px" }}>
              <h3>Catalog Reach</h3>
              <div className="vendor-line-item">
                <span>Low Stock</span>
                <strong>{overview.lowStockProducts}</strong>
              </div>
              <div className="vendor-line-item">
                <span>Auction Ready</span>
                <strong>{overview.auctionExclusive}</strong>
              </div>
              <div className="vendor-line-item">
                <span>Average Rating</span>
                <strong>{overview.averageRating ? overview.averageRating.toFixed(1) : "-"}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
