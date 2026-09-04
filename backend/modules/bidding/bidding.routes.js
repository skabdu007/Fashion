const express = require("express");
const router = express.Router();

const controller = require("./bidding.controller");

const {
  verifyToken,
  authorizeRoles
} = require("../../middleware/auth");

/* PLACE BID */

router.post(
  "/place-bid",
  verifyToken,
  authorizeRoles("CUSTOMER"),
  controller.placeBid
);

/* LEADERBOARD */

router.get(
  "/leaderboard/:auction_id",
  verifyToken,
  controller.bidBoard
);

module.exports = router;