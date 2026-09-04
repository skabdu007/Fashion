import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Orders(){

 const [orders,setOrders] = useState([]);

 useEffect(()=>{

  const loadOrders = async()=>{

   const user = JSON.parse(localStorage.getItem("user"));
   if(!user) return;

   const userId = user.customer?.user_id || user.user_id;

   try{

    const res = await axios.get(
     `/order/user/${userId}`
    );

    setOrders(res.data.data);

   }catch(error){
    console.error(error);
   }

  };

  loadOrders();

 },[]);



 const getStep = (status)=>{

  const steps = {
   PENDING:1,
   PROCESSING:2,
   SHIPPED:3,
   DELIVERED:4
  };

  return steps[status] || 1;

 };



 return(

  <div style={{padding:"30px"}}>

   <h1>My Orders</h1>

   {orders.length === 0 ? (

    <p>No orders yet</p>

   ) : (

    orders.map(order=>{

     const step = getStep(order.status);

     return(

      <div key={order._id} className="order-card">

       <h3>Order ID: {order._id}</h3>

       <p>Total: ₹ {order.total_amount}</p>

       <p>Status: {order.status}</p>

       {/* Status Tracker */}

       <div className="tracker">

        <div className={step>=1 ? "active" : ""}>
         Placed
        </div>

        <div className={step>=2 ? "active" : ""}>
         Processing
        </div>

        <div className={step>=3 ? "active" : ""}>
         Shipped
        </div>

        <div className={step>=4 ? "active" : ""}>
         Delivered
        </div>

       </div>

      </div>

     );

    })

   )}

  </div>

 );

}