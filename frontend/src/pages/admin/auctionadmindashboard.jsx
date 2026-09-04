import { useNavigate, Navigate } from "react-router-dom";

export default function AuctionDashboard(){

 const navigate = useNavigate();
 const user = JSON.parse(localStorage.getItem("user"));

 if(!user || user.role !== "SUPER_ADMIN"){
   return <Navigate to="/admin/dashboard" replace />;
 }

 return(

  <div className="admin-page">

   <h1>Auction Admin Panel</h1>

   <div className="auction-dashboard-grid">

    <button onClick={()=>navigate("/admin/create-auction-room")}>
      Create Auction Room
    </button>

    <button onClick={()=>navigate("/admin/rooms")}>
      All Auction Rooms
    </button>

    <button onClick={()=>navigate("/admin/live-bidding")}>
      Live Auctions
    </button>

    <button onClick={()=>navigate("/admin/winners")}>
      Winners
    </button>

   </div>

  </div>

 )
}