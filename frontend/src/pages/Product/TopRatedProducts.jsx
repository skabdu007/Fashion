import { useEffect,useState } from "react";
import axios from "axios";
import "../../styles/gopal.css";

export default function TopRatedProducts(){

 const [products,setProducts]=useState([]);

 useEffect(()=>{

  axios.get("/product/top-rated")
  .then(res=>setProducts(res.data.data));

 },[]);

 return(

  <div>

   <h2>Top Rated Products</h2>

   <ul>

    {products.map(p=>(
     <li key={p._id}>
      {p.product_name} - Rating: {p.rating}
     </li>
    ))}

   </ul>

  </div>

 )

}