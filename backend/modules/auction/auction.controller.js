const auctionService = require("./auction.service");


exports.createRoom = async (req, res, next) => {

  try {

    const admin_id = req.user.id;

    const result = await auctionService.createRoomService(
      admin_id,
      req.body
    );

    res.json(result);

  } catch (err) {
    next(err);
  }

};

exports.joinRoom = async (req, res, next) => {
  try {

    const user_id = req.user.id;
    const { room_code } = req.body;

    const result = await auctionService.joinRoomService(
      user_id,
      room_code
    );

    res.json(result);

  } catch (err) {
    res.status(403).json({
      success: false,
      message: err.message
    });
  }
};

exports.listRooms = async (req, res, next) => {
  try {
    const result = await auctionService.listRoomsService();
    res.json(result);
  } catch (error) {
    next(error);
  }
};


exports.enterAuction = async (req, res, next) => {
  try {

    const user_id = req.user.id;
    const { room_id } = req.body;

    const result = await auctionService.enterAuctionService(
      user_id,
      room_id
    );

    res.json(result);

  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
};

exports.roomState = async (req, res, next) => {
  try {
    const result = await auctionService.getRoomStateService(
      req.params.auction_id,
      req.user?.id || null
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.sendChatMessage = async (req, res, next) => {
  try {
    const result = await auctionService.addChatMessageService(
      req.user.id,
      req.params.auction_id,
      req.body.message
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.placeBid = async (req, res, next) => {
  try {

    const user_id = req.user.id;
    const { room_id, bid_amount } = req.body;

    const result = await auctionService.placeBidService(
      user_id,
      room_id,
      bid_amount
    );

    res.json(result);

  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
};

exports.foldBidder = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { room_id } = req.body;

    const result = await auctionService.foldBidderService(user_id, room_id);

    res.json(result);
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
};


exports.closeRoom = async (req, res, next) => {
  try {

    const { room_id } = req.body;

    const result = await auctionService.closeRoomService(room_id);

    res.json(result);

  } catch (error) {
    next(error);
  }
};

exports.finalizeCurrentProduct = async (req, res, next) => {
  try {
    const { room_id } = req.body;
    const result = await auctionService.finalizeCurrentProductService(room_id, { reason: "admin-finalize" });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.completeAuction = async (req, res, next) => {
  try {
    const result = await auctionService.finalizeCurrentProductService(
      req.params.auctionId,
      { forceRoomClose: true, reason: "manual-complete" }
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};


exports.bidBoard = async (req, res, next) => {
  try {

    const { room_id } = req.params;

    const result = await auctionService.getBidBoardService(room_id);

    res.json(result);

  } catch (error) {
    next(error);
  }
};
