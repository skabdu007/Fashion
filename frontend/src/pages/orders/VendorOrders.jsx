import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";
import { getStoredUser, getStoredVendor } from "../../utils/session";
import {
  filterVendorOrders,
  filterVendorProducts,
  formatCompactDate,
  getVendorId
} from "../../utils/vendorWorkspace";
import "../../styles/gopal.css";

const statusOptions = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function VendorOrders() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useMemo(() => getStoredUser(), []);
  const vendor = useMemo(() => getStoredVendor(), []);
  const vendorId = getVendorId(vendor, user);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState("");

  const vendorProducts = useMemo(
    () => filterVendorProducts(products, vendorId),
    [products, vendorId]
  );
  const vendorOrders = useMemo(
    () => filterVendorOrders(orders, vendorProducts),
    [orders, vendorProducts]
  );
  const visibleOrders = useMemo(() => {
    if (filter === "ALL") return vendorOrders;
    return vendorOrders.filter((order) => order.status === filter);
  }, [filter, vendorOrders]);

  useEffect(() => {
    const loadOrders = async () => {
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
        toast.error(error.response?.data?.message || "Unable to load vendor orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [toast, vendorId]);

  if (!user || user.role?.toUpperCase() !== "VENDOR") {
    return <Navigate to="/vendor/login" replace />;
  }

  const refreshOrders = async () => {
    const res = await api.get("/order/admin/all");
    setOrders(res.data?.data || []);
  };

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      await api.put(`/order/${orderId}`, { status });
      toast.success(`Order moved to ${status}.`);
      await refreshOrders();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Unable to update order status.");
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return <LoadingSpinner centered label="Loading vendor orders..." />;
  }

  const pendingCount = vendorOrders.filter((order) =>
    ["PENDING", "PAID", "PROCESSING"].includes(order?.status)
  ).length;
  const shippedCount = vendorOrders.filter((order) => order?.status === "SHIPPED").length;
  const deliveredCount = vendorOrders.filter((order) => order?.status === "DELIVERED").length;

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container vendor-workspace">
        <div className="shop-hero vendor-hero">
          <div>
            <h1>Vendor Orders</h1>
            <p>See only the orders connected to your catalog, review the relevant line items, and keep status updates moving.</p>
          </div>

          <div className="dashboard-topbar__actions">
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/vendor/dashboard")}>
              Back to Dashboard
            </button>
            <button className="btn-modern hover-scale" onClick={() => navigate("/vendor/sales-analytics")}>
              Open Analytics
            </button>
          </div>
        </div>

        <div className="summary-grid vendor-summary-grid">
          <div className="summary-tile">
            <div className="summary-label">All Orders</div>
            <div className="summary-value">{vendorOrders.length}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Open Pipeline</div>
            <div className="summary-value">{pendingCount}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Shipped</div>
            <div className="summary-value">{shippedCount}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Delivered</div>
            <div className="summary-value">{deliveredCount}</div>
          </div>
        </div>

        <div className="vendor-filter-row">
          {["ALL", ...statusOptions].map((option) => (
            <button
              key={option}
              className={`vendor-filter-chip ${filter === option ? "is-active" : ""}`}
              onClick={() => setFilter(option)}
            >
              {option === "ALL" ? "All Orders" : option}
            </button>
          ))}
        </div>

        <div className="vendor-order-list">
          {visibleOrders.length === 0 ? (
            <div className="glass-card stack-card empty-state vendor-empty-state">
              No vendor orders found for this filter.
            </div>
          ) : (
            visibleOrders.map((order) => (
              <article key={order._id} className="glass-card stack-card vendor-order-card vendor-order-card--full">
                <div className="vendor-order-card__top">
                  <div>
                    <h2>Order #{String(order._id).slice(-8)}</h2>
                    <p>
                      {order?.user_id?.username || "Customer"} | {order?.user_id?.email || "No email"}
                    </p>
                  </div>
                  <span className={`status ${order.status || "PENDING"}`}>
                    {order.status || "PENDING"}
                  </span>
                </div>

                <div className="vendor-order-card__meta vendor-order-card__meta--wide">
                  <span>Relevant items {order.relevantQuantity}</span>
                  <span>Vendor value Rs. {Math.round(order.relevantTotal).toLocaleString()}</span>
                  <span>Placed {formatCompactDate(order.createdAt)}</span>
                  <span>{order.isSharedOrder ? "Mixed vendor order" : "Dedicated vendor order"}</span>
                </div>

                <div className="vendor-line-items">
                  {order.relevantItems.map((item) => (
                    <div key={`${order._id}-${item.product_id?._id || item.product_id}`} className="vendor-line-item">
                      <strong>{item.product_id?.product_name || "Product"}</strong>
                      <span>Qty {item.quantity}</span>
                      <span>Rs. {Number(item.price || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="cta-row vendor-orders__actions">
                  <button className="btn-secondary-modern hover-scale" onClick={() => navigate(`/vendor/order/${order._id}`)}>
                    View Details
                  </button>

                  {!order.isSharedOrder ? (
                    <select
                      value={order.status || "PENDING"}
                      onChange={(event) => updateStatus(order._id, event.target.value)}
                      disabled={updatingId === order._id}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          Mark {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="info-banner vendor-info-inline">
                      Shared order: status updates are shown for reference only.
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
