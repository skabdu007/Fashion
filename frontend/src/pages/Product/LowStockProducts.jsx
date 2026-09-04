import { useEffect,useState } from "react";
import axios from "axios";
import "../../styles/gopal.css";


export default function LowStockProducts(){

 const [products,setProducts]=useState([]);

 useEffect(()=>{

  axios.get("/product/low-stock")
  .then(res=>setProducts(res.data.data));

 },[]);

 return(

  <div>

   <h2>Low Stock Products</h2>

   <ul>

    {products.map(p=>(
     <li key={p._id}>
      {p.product_name} - Stock: {p.stock}
     </li>
    ))}

   </ul>

  </div>

 )

}