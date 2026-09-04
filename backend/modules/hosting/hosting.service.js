const Hosting = require("./hosting.model");
const Auction = require("../auction/auction.model");
const auctionService = require("../auction/auction.service");

/* START AUCTION */

exports.startAuctionService = async (auction_id, admin_id) => {

  const auction = await Auction.findById(auction_id);

  if (!auction) {
    return {
      success: false,
      message: "Auction not found"
    };
  }

  if (auction.status === "LIVE") {
    return {
      success: false,
      message: "Auction already started"
    };
  }

  if (!auction.products?.length) {
    return {
      success: false,
      message: "Add auction products before starting the room"
    };
  }

  if (auction.start_time && new Date(auction.start_time) > new Date()) {
    return {
      success: false,
      message: "This auction room cannot start before its scheduled start date and time."
    };
  }

  if (auction.end_time && new Date(auction.end_time) <= new Date()) {
    return {
      success: false,
      message: "This auction room end date and time has already passed."
    };
  }

  auction.status = "LIVE";
  auction.current_product_index = 0;

  auction.products = auction.products.map((product, index) => ({
    ...product.toObject(),
    status: index === 0 ? "LIVE" : product.status === "SOLD" || product.status === "UNSOLD" ? product.status : "PENDING",
    current_price: product.current_price || product.min_bid
  }));

  const currentProduct = auction.products[0];
  auction.product_id = currentProduct.product_id;
  auction.current_price = currentProduct.current_price || currentProduct.min_bid;
  auction.highest_bidder_id = currentProduct.highest_bidder_id || null;
  auction.highest_bidder_name = currentProduct.highest_bidder_nickname || currentProduct.highest_bidder_name || "";
  auction.start_time = new Date();
  auction.end_time = new Date(Date.now() + Number(auction.turn_time_seconds || 60) * 1000);

  await auction.save();

  const hosting = new Hosting({
    auction_id: auction._id,
    host_id: admin_id,
    status: "LIVE",
    started_at: new Date()
  });

  await hosting.save();
  await auctionService.ensureAuctionTimer(auction_id);
  await auctionService.emitAuctionState(auction_id);

  return {
    success: true,
    message: "Auction started successfully"
  };

};
