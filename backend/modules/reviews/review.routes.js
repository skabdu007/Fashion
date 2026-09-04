const express = require("express");

const router = express.Router();

const controller = require("./review.controller");

router.post("/", controller.create);

router.get("/:product_id", controller.getByProduct);

module.exports = router;