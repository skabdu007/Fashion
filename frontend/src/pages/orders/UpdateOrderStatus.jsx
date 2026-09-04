import { useParams } from "react-router-dom";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";

export default function UpdateOrderStatus() {
  const { id } = useParams();
  const toast = useToast();

  const update = async (status) => {
    try {
      await api.put(`/order/${id}`, { status });
      toast.success(`Status updated to ${status}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    }
  };

  return (
    <div className="admin-main fade-in-page">
      <h2>Update Order Status</h2>
      <button className="hover-scale" onClick={() => update("PROCESSING")}>Processing</button>
      <button className="hover-scale" onClick={() => update("SHIPPED")}>Shipped</button>
      <button className="hover-scale" onClick={() => update("DELIVERED")}>Delivered</button>
    </div>
  );
}
