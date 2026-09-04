const express = require("express");

const router = express.Router();

const controller = require("./wallet.controller");
const { verifyToken } = require("../../middleware/auth");

router.post("/buy-chips", verifyToken, controller.buyChips);
router.post("/add", verifyToken, controller.buyChips);
router.post("/add-money", verifyToken, controller.addMoney);
router.post("/deduct", verifyToken, controller.deductChips);
router.get("/history/:user_id", verifyToken, controller.getHistory);
router.get("/:user_id", verifyToken, controller.viewWallet);

module.exports = router;
