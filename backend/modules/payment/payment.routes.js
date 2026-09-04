const express = require("express");

const router = express.Router();

const controller = require("./payment.controller");

router.post("/direct", controller.payDirect);

router.post("/", controller.pay);

router.get("/:order_id", controller.getPayment);

module.exports = router;