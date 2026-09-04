import { useEffect,useState } from "react";
import api from "../../utils/axios";

export default function LiveBidding(){

 const [rooms,setRooms] = useState([]);

 useEffect(()=>{

  const load = async()=>{

   const res = await api.get("/auction/rooms");

   const live = (res.data.data || []).filter(
    r=>r.status==="LIVE"
   );

   setRooms(live);

  };

  load();

 },[]);

 return(

  <div className="admin-main">

   <h2>Live Auctions</h2>

   {rooms.map(r=>(
    <div key={r._id}>
     {r.product_name} - {r.room_code}
    </div>
   ))}

  </div>

 );

}
