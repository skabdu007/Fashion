const express = require("express");
const router = express.Router();

const controller = require("./winner.controller");

const {
  verifyToken,
  requireSuperAdmin
} = require("../../middleware/auth");

/* CLOSE AUCTION */

router.post(
  "/close-auction",
  verifyToken,
  requireSuperAdmin,
  controller.closeAuction
);

/* WINNER LIST */

router.get(
  "/list",
  verifyToken,
  controller.getWinners
);

router.get(
  "/:auction_id",
  verifyToken,
  controller.getWinnerByAuction
);

module.exports = router;
