const hostingService = require("./hosting.service");

/* CREATE */
exports.createAuction = async (req, res, next) => {
    try {
        const result = await hostingService.createAuctionService(req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

/* GET ALL */
exports.getAuctions = async (req, res, next) => {
    try {
        const result = await hostingService.getAuctionsService();
        res.json(result);
    } catch (err) {
        next(err);
    }
};

/* ADD PRODUCT */
exports.addProduct = async (req, res, next) => {
    try {
        const result = await hostingService.addAuctionProductService(req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

/* CLOSE */
exports.closeAuction = async (req, res, next) => {
    try {
        const { auction_id } = req.body;
        const result = await hostingService.closeAuctionService(auction_id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

/* START */


exports.startAuction = async (req, res, next) => {

  try {

    const admin_id = req.user?.id || null;
    const { auction_id } = req.body;

    const result =
      await hostingService.startAuctionService(
        auction_id,
        admin_id
      );

    res.json(result);

  } catch (err) {
    next(err);
  }

};