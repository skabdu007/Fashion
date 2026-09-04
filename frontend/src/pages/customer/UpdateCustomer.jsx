import { useEffect,useState } from "react";
import axios from "axios";
import { useParams,useNavigate } from "react-router-dom";

export default function UpdateCustomer(){

 const {id} = useParams();
 const navigate = useNavigate();

 const [form,setForm] = useState({});

 useEffect(()=>{

  axios.get(`/customer/${id}`)
  .then(res=>setForm(res.data.data));

 },[id]);

 const handleChange=(e)=>{
  setForm({...form,[e.target.name]:e.target.value});
 };

 const handleSubmit=async(e)=>{

  e.preventDefault();

  await axios.put(`/customer/${id}`,form);

  navigate("/admin/customers/all");

 };

 return(

  <div className="admin-main">

   <h2>Update Customer</h2>

   <form onSubmit={handleSubmit}>

    <input name="username" value={form.username||""} onChange={handleChange}/>
    <input name="email" value={form.email||""} onChange={handleChange}/>
    <input name="phone" value={form.phone||""} onChange={handleChange}/>
    <input name="address" value={form.address||""} onChange={handleChange}/>

    <button type="submit">Update</button>

   </form>

  </div>

 );
}