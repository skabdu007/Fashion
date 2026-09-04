import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/ui/ToastProvider";
import { confirmAction } from "../../utils/alerts";
import api from "../../utils/axios";

export default function CancelOrder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const cancel = async () => {
    try {
      const confirmation = await confirmAction({
        title: "Cancel this order?",
        text: "If eligible, any refund logic will be handled on the server.",
        confirmButtonText: "Cancel order"
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      await api.put(`/order/cancel/${id}`);
      toast.success("Order cancelled successfully.");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Unable to cancel order");
    }
  };

  return (
    <div className="admin-main fade-in-page">
      <h2>Cancel Order</h2>
      <button className="hover-scale" onClick={cancel}>Cancel Order</button>
    </div>
  );
}
