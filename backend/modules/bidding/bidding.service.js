const Bid = require("./bid.model");
const Auction = require("../auction/auction.model");

/* PLACE BID */

exports.placeBidService = async (user_id, auction_id, bid_amount) => {

  const auction = await Auction.findById(auction_id);

  if (!auction)
    return { success: false, message: "Auction not found" };

  if (auction.status !== "LIVE")
    return { success: false, message: "Auction not live" };

  const highest = await Bid
    .find({ auction_id })
    .sort({ bid_amount: -1 })
    .limit(1);

  const highestBid = highest.length
    ? highest[0].bid_amount
    : auction.min_bid;

  if (bid_amount <= highestBid)
    return { success: false, message: "Bid too low" };

  const bid = new Bid({
    auction_id,
    user_id,
    bid_amount
  });

  await bid.save();

  return {
    success: true,
    message: "Bid placed successfully"
  };

};


/* LEADERBOARD */

exports.getBidBoardService = async (auction_id) => {

  const bids = await Bid
    .find({ auction_id })
    .sort({ bid_amount: -1 })
    .limit(10)
    .populate("user_id", "username");

  return {
    success: true,
    bids
  };

};