import { useState } from "react";
import axios from "axios";

export default function SearchCustomer(){

 const [keyword,setKeyword] = useState("");
 const [results,setResults] = useState([]);

 const search=async()=>{

  const res = await axios.get(
   `/customer/search?q=${keyword}`
  );

  setResults(res.data.data);

 };

 return(

  <div className="admin-main">

   <h2>Search Customer</h2>

   <input
    placeholder="Search by name"
    onChange={(e)=>setKeyword(e.target.value)}
   />

   <button onClick={search}>Search</button>

   {results.map(c=>(
    <p key={c._id}>{c.username} - {c.email}</p>
   ))}

  </div>

 );

}