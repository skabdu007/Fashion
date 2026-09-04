const Winner = require("./winner.model");
const Auction = require("../auction/auction.model");
const auctionService = require("../auction/auction.service");

exports.closeAuctionService = async (auction_id) => {
  const result = await auctionService.closeRoomService(auction_id);

  if (!result.success) {
    return result;
  }

  const winners = await Winner.find({ auction_id })
    .populate("auction_id")
    .populate("product_id", "product_name image")
    .populate("user_id", "username nickname")
    .sort({ declared_at: -1 });

  return {
    success: true,
    winners
  };
};

exports.getWinnerListService = async () => {
  const winners = await Winner.find()
    .populate("auction_id")
    .populate("product_id", "product_name image")
    .populate("user_id", "username nickname")
    .sort({ declared_at: -1 });

  return {
    success: true,
    winners
  };
};

exports.getWinnerByAuctionService = async (auction_id) => {
  const auction = await Auction.findById(auction_id).select("room_code status");

  const winners = await Winner.find({ auction_id })
    .populate("auction_id")
    .populate("product_id", "product_name image")
    .populate("user_id", "username nickname")
    .sort({ declared_at: -1 });

  return {
    success: true,
    auction,
    winners,
    winner: winners[0] || null
  };
};
