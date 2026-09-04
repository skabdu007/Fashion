import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import { confirmAction } from "../../utils/alerts";
import api from "../../utils/axios";
import "../../styles/gopal.css";

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/order/admin/all");
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Order Load Error:", err);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/order/${id}`, { status });
      toast.success(`Order updated to ${status}.`);
      await loadOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const deleteOrder = async (id) => {
    const confirmation = await confirmAction({
      title: "Delete this order?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete order"
    });

    if (!confirmation.isConfirmed) return;

    try {
      await api.delete(`/order/${id}`);
      toast.success("Order deleted successfully.");
      await loadOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="admin-main fade-in-page">
      <h2>All Orders</h2>

      {loading ? (
        <LoadingSpinner centered label="Loading orders..." />
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6">No Orders Found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-5)}</td>
                  <td>{order.user_id?.username || "N/A"}</td>
                  <td>Rs. {order.total_amount}</td>
                  <td>
                    <span className={`status ${order.status}`}>{order.status}</span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-primary hover-scale" onClick={() => navigate(`/admin/order/${order._id}`)}>
                      View
                    </button>

                    {order.status === "PENDING" && (
                      <button className="btn-warning hover-scale" onClick={() => updateStatus(order._id, "PROCESSING")}>
                        Process
                      </button>
                    )}

                    {order.status === "PROCESSING" && (
                      <button className="btn-info hover-scale" onClick={() => updateStatus(order._id, "SHIPPED")}>
                        Ship
                      </button>
                    )}

                    {order.status === "SHIPPED" && (
                      <button className="btn-success hover-scale" onClick={() => updateStatus(order._id, "DELIVERED")}>
                        Deliver
                      </button>
                    )}

                    <button className="btn-danger hover-scale" onClick={() => deleteOrder(order._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
