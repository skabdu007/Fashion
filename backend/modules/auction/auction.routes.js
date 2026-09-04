const express = require("express");
const router = express.Router();

const controller = require("./auction.controller");

const {
  verifyToken,
  requireSuperAdmin,
  authorizeRoles
} = require("../../middleware/auth");

/* CREATE ROOM */
router.post(
  "/create-room",
  verifyToken,
  requireSuperAdmin,
  controller.createRoom
);

/* JOIN ROOM */
router.post(
  "/join-room",
  verifyToken,
  authorizeRoles("CUSTOMER"),
  controller.joinRoom
);

router.get(
  "/rooms",
  verifyToken,
  controller.listRooms
);

/* ENTER */
router.post(
  "/enter",
  verifyToken,
  authorizeRoles("CUSTOMER"),
  controller.enterAuction
);

/* BID */
router.post(
  "/bid",
  verifyToken,
  authorizeRoles("CUSTOMER"),
  controller.placeBid
);

router.post(
  "/fold",
  verifyToken,
  authorizeRoles("CUSTOMER"),
  controller.foldBidder
);

/* CLOSE */
router.post(
  "/close-room",
  verifyToken,
  requireSuperAdmin,
  controller.closeRoom
);

router.post(
  "/finalize-product",
  verifyToken,
  requireSuperAdmin,
  controller.finalizeCurrentProduct
);

router.post(
  "/complete/:auctionId",
  verifyToken,
  requireSuperAdmin,
  controller.completeAuction
);

/* BOARD */
router.get(
  "/board/:room_id",
  verifyToken,
  controller.bidBoard
);

router.get(
  "/room/:auction_id/state",
  verifyToken,
  controller.roomState
);

router.post(
  "/room/:auction_id/chat",
  verifyToken,
  controller.sendChatMessage
);

module.exports = router;
