const biddingService = require("./bidding.service");

/* PLACE BID */

exports.placeBid = async (req, res, next) => {
  try {

    const user_id = req.user.id;

    const { auction_id, bid_amount } = req.body;

    const result = await biddingService.placeBidService(
      user_id,
      auction_id,
      bid_amount
    );

    res.json(result);

  } catch (err) {
    next(err);
  }
};


/* BID BOARD */

exports.bidBoard = async (req, res, next) => {
  try {

    const { auction_id } = req.params;

    const result = await biddingService.getBidBoardService(
      auction_id
    );

    res.json(result);

  } catch (err) {
    next(err);
  }
};