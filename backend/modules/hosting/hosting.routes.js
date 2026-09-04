const express = require("express");
const router = express.Router();
const controller = require("./hosting.controller");

const {
  verifyToken,
  requireSuperAdmin
} = require("../../middleware/auth");

router.post("/create", controller.createAuction);
router.get("/list", controller.getAuctions);
router.post("/add-product", controller.addProduct);
router.post("/close", controller.closeAuction);

router.post(
  "/start",
  verifyToken,
  requireSuperAdmin,
  controller.startAuction
);

module.exports = router;