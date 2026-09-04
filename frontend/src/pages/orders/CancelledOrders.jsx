import { useEffect,useState } from "react";
import axios from "axios";

export default function CancelledOrders(){

 const [orders,setOrders] = useState([]);

 useEffect(()=>{

  const loadOrders = async()=>{

   const res = await axios.get(
    "/order/admin/all"
   );

   const cancelled = res.data.data.filter(
    o => o.status === "CANCELLED"
   );

   setOrders(cancelled);

  };

  loadOrders();

 },[]);

 return(

  <div className="admin-main">

   <h2>Cancelled Orders</h2>

   <table border="1" cellPadding="10" width="100%">

    <thead>
     <tr>
      <th>Order ID</th>
      <th>Total</th>
      <th>Status</th>
     </tr>
    </thead>

    <tbody>

     {orders.map(o=>(
      <tr key={o._id}>
       <td>{o._id}</td>
       <td>{o.total_amount}</td>
       <td>{o.status}</td>
      </tr>
     ))}

    </tbody>

   </table>

  </div>

 );

}