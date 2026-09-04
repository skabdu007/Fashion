import { useEffect,useState } from "react";
import axios from "axios";

export default function BlockedCustomers(){

 const [customers,setCustomers] = useState([]);

 useEffect(()=>{

  axios.get("/customer")
  .then(res=>{
   const blocked = res.data.data.filter(c=>c.status==="BLOCKED");
   setCustomers(blocked);
  });

 },[]);

 return(

  <div className="admin-main">

   <h2>Blocked Customers</h2>

   {customers.map(c=>(
    <p key={c._id}>{c.username} - {c.email}</p>
   ))}

  </div>

 );

}