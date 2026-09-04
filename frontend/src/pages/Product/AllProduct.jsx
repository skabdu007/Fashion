import { useEffect,useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/gopal.css";


export default function AllProduct(){

 const [products,setProducts]=useState([]);
 const navigate = useNavigate();

 useEffect(()=>{

  const fetchProducts = async ()=>{

   try{

    const res = await axios.get("/product");

    setProducts(res.data.data);

   }catch(err){

    console.error(err);

   }

  };

  fetchProducts();

 },[]);

 const loadProducts = async ()=>{

  const res = await axios.get("/product");

  setProducts(res.data.data);

 };

 const deleteProduct = async(id)=>{

  await axios.delete(`/product/${id}`);

  loadProducts();

 };

 return(

  <div>

   <h2>All Products</h2>

   <table border="1">

    <thead>
     <tr>
      <th>Name</th>
      <th>Price</th>
      <th>Stock</th>
      <th>Action</th>
     </tr>
    </thead>

    <tbody>

     {products.map(p=>(
      <tr key={p._id}>

       <td>{p.product_name}</td>
       <td>{p.price}</td>
       <td>{p.stock}</td>

       <td>

        <button onClick={()=>navigate(`/admin/products/update/${p._id}`)}>
         Edit
        </button>

        <button onClick={()=>deleteProduct(p._id)}>
         Delete
        </button>

       </td>

      </tr>
     ))}

    </tbody>

   </table>

  </div>

 )

}