import { useParams } from "react-router-dom";
import LiveAuctionRoom from "../../components/auction/LiveAuctionRoom";

export default function AuctionLiveDashboard() {
  const { auction_id } = useParams();

  return <LiveAuctionRoom auctionId={auction_id} mode="admin" />;
}
