import { useParams } from "react-router-dom";
import LiveAuctionRoom from "../../components/auction/LiveAuctionRoom";

export default function AuctionUserPage() {
  const { auction_id } = useParams();

  return <LiveAuctionRoom auctionId={auction_id} mode="customer" />;
}
