const express = require("express");
const router = express.Router();
const controller = require("./cart.controller");

router.post("/add", controller.addToCart);
router.get("/", controller.viewCart);
router.put("/:id", controller.updateItem);
router.delete("/:id", controller.removeItem);

module.exports = router;