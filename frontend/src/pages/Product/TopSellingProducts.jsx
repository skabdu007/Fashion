import { useEffect,useState } from "react";
import axios from "axios";
import "../../styles/gopal.css";

export default function TopSellingProducts(){

 const [products,setProducts]=useState([]);

 useEffect(()=>{

  axios.get("/product/top-selling")
  .then(res=>setProducts(res.data.data));

 },[]);

 return(

  <div>

   <h2>Top Selling Products</h2>

   <ul>

    {products.map(p=>(
     <li key={p._id}>
      {p.product_name} - Sold: {p.sold_count}
     </li>
    ))}

   </ul>

  </div>

 )

}