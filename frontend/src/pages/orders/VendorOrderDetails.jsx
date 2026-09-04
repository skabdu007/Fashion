import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";
import { getStoredUser, getStoredVendor } from "../../utils/session";
import {
  buildVendorProductMap,
  decorateVendorOrder,
  filterVendorProducts,
  formatCompactDate,
  getVendorId
} from "../../utils/vendorWorkspace";
import "../../styles/gopal.css";

const statusOptions = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function VendorOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useMemo(() => getStoredUser(), []);
  const vendor = useMemo(() => getStoredVendor(), []);
  const vendorId = getVendorId(vendor, user);

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!vendorId || !id) return;

      try {
        setLoading(true);
        const [orderRes, productRes] = await Promise.all([
          api.get(`/order/${id}`),
          api.get("/product")
        ]);

        setOrder(orderRes.data?.data || null);
        setProducts(productRes.data?.data || []);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Unable to load order details.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, toast, vendorId]);

  if (!user || user.role?.toUpperCase() !== "VENDOR") {
    return <Navigate to="/vendor/login" replace />;
  }

  const vendorProducts = useMemo(
    () => filterVendorProducts(products, vendorId),
    [products, vendorId]
  );
  const vendorProductMap = useMemo(
    () => buildVendorProductMap(vendorProducts),
    [vendorProducts]
  );
  const decoratedOrder = useMemo(
    () => (order ? decorateVendorOrder(order, vendorProductMap) : null),
    [order, vendorProductMap]
  );

  const updateStatus = async (status) => {
    if (!decoratedOrder?._id || decoratedOrder.isSharedOrder) return;

    try {
      setUpdating(true);
      await api.put(`/order/${decoratedOrder._id}`, { status });
      const refreshed = await api.get(`/order/${decoratedOrder._id}`);
      setOrder(refreshed.data?.data || decoratedOrder);
      toast.success(`Order updated to ${status}.`);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Unable to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner centered label="Loading order details..." />;
  }

  if (!decoratedOrder || decoratedOrder.relevantItems.length === 0) {
    return (
      <div className="shop-shell">
        <div className="shop-container">
          <div className="glass-card stack-card empty-state vendor-empty-state">
            This order does not contain products from your store.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container vendor-workspace">
        <div className="shop-hero vendor-hero">
          <div>
            <h1>Vendor Order Details</h1>
            <p>Review only the items that belong to your store and keep fulfillment moving with cleaner order context.</p>
          </div>

          <div className="dashboard-topbar__actions">
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/vendor/orders")}>
              Back to Orders
            </button>
            <span className={`status ${decoratedOrder.status || "PENDING"}`}>
              {decoratedOrder.status || "PENDING"}
            </span>
          </div>
        </div>

        <div className="vendor-dashboard-grid">
          <section className="glass-card stack-card vendor-dashboard-grid__main">
            <h2 className="section-title">Relevant Line Items</h2>

            <div className="vendor-line-items vendor-line-items--details">
              {decoratedOrder.relevantItems.map((item) => (
                <div key={item.product_id?._id || item.product_id} className="vendor-line-item">
                  <div>
                    <strong>{item.product_id?.product_name || "Product"}</strong>
                    <span>{item.product_id?.price ? `Listed Rs. ${Number(item.product_id.price).toLocaleString()}` : "No listed price"}</span>
                  </div>
                  <div>
                    <span>Qty {item.quantity}</span>
                    <strong>Rs. {Number(item.price || 0).toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="glass-card stack-card vendor-dashboard-grid__side">
            <h2 className="section-title">Order Snapshot</h2>

            <div className="vendor-stat-list">
              <div>
                <span>Order ID</span>
                <strong>{String(decoratedOrder._id).slice(-8)}</strong>
              </div>
              <div>
                <span>Customer</span>
                <strong>{decoratedOrder?.user_id?.username || decoratedOrder?.user_id?.email || "Customer"}</strong>
              </div>
              <div>
                <span>Vendor Value</span>
                <strong>Rs. {Math.round(decoratedOrder.relevantTotal).toLocaleString()}</strong>
              </div>
              <div>
                <span>Placed On</span>
                <strong>{formatCompactDate(decoratedOrder.createdAt)}</strong>
              </div>
            </div>

            {decoratedOrder.isSharedOrder ? (
              <div className="info-banner vendor-info-inline" style={{ marginTop: "20px" }}>
                Mixed vendor order detected. Status editing is disabled to avoid changing another vendor's delivery flow.
              </div>
            ) : (
              <div className="vendor-status-actions">
                <h3>Update Status</h3>
                <div className="vendor-filter-row">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      className={`vendor-filter-chip ${decoratedOrder.status === status ? "is-active" : ""}`}
                      onClick={() => updateStatus(status)}
                      disabled={updating}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
