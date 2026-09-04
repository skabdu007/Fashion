const winnerService = require("./winner.service");

/* CLOSE AUCTION */

exports.closeAuction = async (req, res, next) => {

  try {

    const { auction_id } = req.body;

    const result =
      await winnerService.closeAuctionService(auction_id);

    res.json(result);

  } catch (err) {

    next(err);

  }

};


/* WINNER LIST */

exports.getWinners = async (req, res, next) => {

  try {

    const result =
      await winnerService.getWinnerListService();

    res.json(result);

  } catch (err) {

    next(err);

  }

};

exports.getWinnerByAuction = async (req, res, next) => {
  try {
    const result = await winnerService.getWinnerByAuctionService(req.params.auction_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
