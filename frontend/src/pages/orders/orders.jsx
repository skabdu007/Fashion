import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCurrentUser from "../../hooks/useCurrentUser";
import useCountdown from "../../hooks/useCountdown";
import { getUserOrders } from "../../services/orderService";
import "../../styles/gopal.css";

function DeliveryCountdown({ deadline, status }) {
  const countdown = useCountdown(deadline);

  if (!deadline || ["DELIVERED", "CANCELLED"].includes(status)) {
    return <span className="line-item-meta">Delivery timer closed</span>;
  }

  return (
    <span className={`line-item-meta ${countdown.isExpired ? "text-danger" : ""}`}>
      Delivery window: {countdown.label}
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const { userId } = useCurrentUser();

  useEffect(() => {
    const loadOrders = async () => {
      if (!userId) return;

      try {
        const orderItems = await getUserOrders(userId);
        setOrders(orderItems || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadOrders();
  }, [userId]);

  const getStep = (status) => {
    const steps = {
      PENDING: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4
    };
    return steps[status] || 1;
  };

  const activeOrders = useMemo(
    () => orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length,
    [orders]
  );
  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "DELIVERED").length,
    [orders]
  );
  const cancelledOrders = useMemo(
    () => orders.filter((order) => order.status === "CANCELLED").length,
    [orders]
  );

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container vendor-workspace">
        <div className="shop-hero vendor-hero">
          <div>
            <h1>My Orders</h1>
            <p>Track your placed orders, delivery progress, and follow-up actions from one polished view.</p>
          </div>

          <div className="dashboard-topbar__actions">
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/")}>
              Continue Shopping
            </button>
            <button className="btn-modern hover-scale" onClick={() => navigate("/customer/dashboard")}>
              Open Dashboard
            </button>
          </div>
        </div>

        <div className="summary-grid vendor-summary-grid">
          <div className="summary-tile">
            <div className="summary-label">Total Orders</div>
            <div className="summary-value">{orders.length}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Active</div>
            <div className="summary-value">{activeOrders}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Delivered</div>
            <div className="summary-value">{deliveredOrders}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Cancelled</div>
            <div className="summary-value">{cancelledOrders}</div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="glass-card stack-card empty-state vendor-empty-state">No orders yet.</div>
        ) : (
          <div className="vendor-order-list">
            {orders.map((order) => {
              const step = getStep(order.status);

              return (
                <article key={order._id} className="glass-card stack-card vendor-order-card vendor-order-card--full">
                  <div className="vendor-order-card__top">
                    <div>
                      <h2>Order #{order._id.slice(-6)}</h2>
                      <p>{order.items?.length || 0} items in this order</p>
                    </div>
                    <span className={`status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="vendor-order-card__meta vendor-order-card__meta--wide">
                    <span>Rs. {Number(order.total_amount || 0).toLocaleString()}</span>
                    <span>{new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString("en-IN")}</span>
                  </div>

                  <DeliveryCountdown deadline={order.delivery_deadline} status={order.status} />

                  <div className="tracker">
                    <div className={step >= 1 ? "active" : ""}>Placed</div>
                    <div className={step >= 2 ? "active" : ""}>Processing</div>
                    <div className={step >= 3 ? "active" : ""}>Shipped</div>
                    <div className={step >= 4 ? "active" : ""}>Delivered</div>
                  </div>

                  <div className="cta-row">
                    <button className="btn-modern hover-scale" onClick={() => navigate(`/order/${order._id}`)}>
                      View Details
                    </button>

                    {order.status === "DELIVERED" && order.items?.[0]?.product_id?._id ? (
                      <button
                        className="btn-secondary-modern hover-scale"
                        onClick={() => navigate(`/products/${order.items[0].product_id._id}`)}
                      >
                        Review Product
                      </button>
                    ) : null}

                    {order.status !== "DELIVERED" && order.status !== "CANCELLED" ? (
                      <button
                        className="btn-danger-modern hover-scale"
                        onClick={() => navigate(`/order/cancel/${order._id}`)}
                      >
                        Cancel Order
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
