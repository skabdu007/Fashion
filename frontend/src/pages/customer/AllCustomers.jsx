import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AllCustomers(){

 const [customers,setCustomers] = useState([]);
 const navigate = useNavigate();

 const loadCustomers = async () => {
  try{
   const res = await axios.get("/customer");
   setCustomers(res.data.data || []);
  }catch(err){
   console.error(err);
  }
 };

 useEffect(() => {

  const fetchCustomers = async () => {
   try{
    const res = await axios.get("/customer");
    setCustomers(res.data.data || []);
   }catch(err){
    console.error(err);
   }
  };

  fetchCustomers();

 }, []);

 const deleteCustomer = async (id) => {
  await axios.delete(`/customer/${id}`);
  loadCustomers();
 };

 const blockCustomer = async (id) => {
  await axios.put(`/customer/block/${id}`);
  loadCustomers();
 };

 const unblockCustomer = async (id) => {
  await axios.put(`/customer/unblock/${id}`);
  loadCustomers();
 };

 return(

  <div className="admin-main">

   <h2>All Customers</h2>

   <table>

    <thead>
     <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Phone</th>
      <th>Status</th>
      <th>Action</th>
     </tr>
    </thead>

    <tbody>

     {customers.map(c => (
      <tr key={c._id}>

       <td>{c.username}</td>
       <td>{c.email}</td>
       <td>{c.phone}</td>
       <td>{c.status}</td>

       <td>

        <button
         className="btn-edit"
         onClick={() => navigate(`/admin/customers/update/${c._id}`)}
        >
         Edit
        </button>

        <button
         className="btn-delete"
         onClick={() => deleteCustomer(c._id)}
        >
         Delete
        </button>

        {c.status === "ACTIVE" ? (

         <button
          className="btn-block"
          onClick={() => blockCustomer(c._id)}
         >
          Block
         </button>

        ) : (

         <button
          className="btn-unblock"
          onClick={() => unblockCustomer(c._id)}
         >
          Unblock
         </button>

        )}

       </td>

      </tr>
     ))}

    </tbody>

   </table>

  </div>

 );

}