import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../utils/axios";
import "../../styles/gopal.css";

const applyBoardState = (data, setBoard, setHighest) => {
  setBoard(data);
  setHighest(data.length > 0 ? data[0].bid_amount : 0);
};

export default function Auction() {
  const { auction_id } = useParams();
  const [bidAmount, setBidAmount] = useState("");
  const [board, setBoard] = useState([]);
  const [highest, setHighest] = useState(0);
  const [message, setMessage] = useState("");
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadBoard = async () => {
    try {
      const res = await axios.get(`/auction/board/${auction_id}`);
      const data = res.data.bids || [];

      applyBoardState(data, setBoard, setHighest);
    } catch (err) {
      console.error("Board load error:", err);
    }
  };

  useEffect(() => {
    if (!auction_id) return;

    const pollBoard = async () => {
      try {
        const res = await axios.get(`/auction/board/${auction_id}`);
        const data = res.data.bids || [];

        applyBoardState(data, setBoard, setHighest);
      } catch (err) {
        console.error("Board load error:", err);
      }
    };

    pollBoard();

    const interval = setInterval(() => {
      pollBoard();
    }, 3000);

    return () => clearInterval(interval);
  }, [auction_id]);

  const enterAuction = async () => {
    try {
      const res = await axios.post("/auction/enter", {
        room_id: auction_id
      });

      if (res.data.success) {
        setEntered(true);
      }

      setMessage(res.data.message);
    } catch {
      setMessage("Unable to enter auction");
    }
  };

  const placeBid = async () => {
    if (!entered) {
      setMessage("Please enter the auction first");
      return;
    }

    if (!bidAmount) {
      setMessage("Enter a valid bid amount");
      return;
    }

    if (Number(bidAmount) <= highest) {
      setMessage("Bid must be higher than current highest bid");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/bidding/place", {
        auction_id,
        bid_amount: Number(bidAmount)
      });

      setMessage(res.data.message);
      setBidAmount("");

      await loadBoard();
    } catch {
      setMessage("Bid failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auction-container">
      <div className="auction-card">
        <h1>Live Auction Arena</h1>

        <p>Highest Bid: Rs. {highest.toLocaleString()}</p>

        {message && <p className="auction-message">{message}</p>}

        <button
          className="auction-btn"
          onClick={enterAuction}
          disabled={entered}
        >
          {entered ? "Joined Auction" : "Enter Auction"}
        </button>

        <div className="bid-box">
          <input
            type="number"
            placeholder="Enter your bid amount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            disabled={!entered}
          />

          <button
            className="auction-btn"
            onClick={placeBid}
            disabled={!entered || loading || !bidAmount}
          >
            {loading ? "Placing Bid..." : "Place Bid"}
          </button>
        </div>

        <h3>Leaderboard</h3>

        <div className="leaderboard">
          {board.length === 0 ? (
            <p>No bids yet</p>
          ) : (
            board.map((item, index) => (
              <div key={index} className="leader-row">
                <span>
                  {index === 0 ? "Top Bidder - " : ""}
                  {index + 1}. {item.user_id?.username || "User"}
                </span>

                <span>Rs. {Number(item.bid_amount).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
