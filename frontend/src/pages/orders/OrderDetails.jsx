import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/axios";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/order/${id}`).then((res) => setOrder(res.data.data));
  }, [id]);

  if (!order) return <p>Loading...</p>;

  return (
    <div className="admin-main">
      <h2>Order Details</h2>

      <p>Total Amount: {order.total_amount}</p>
      <p>Status: {order.status}</p>

      {order.items.map((i) => (
        <div key={i._id}>
          <p>{i.product_id.product_name}</p>
          <p>Qty: {i.quantity}</p>
          <p>Price: {i.price}</p>
        </div>
      ))}
    </div>
  );
}
