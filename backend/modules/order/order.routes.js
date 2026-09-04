const express = require("express");
const router = express.Router();
const controller = require("./order.controller");
const { verifyToken } = require("../../middleware/auth");

router.post("/", verifyToken, controller.createOrder);
router.get("/eligibility/:user_id", verifyToken, controller.getOrderEligibility);
router.get("/user/:user_id", verifyToken, controller.getUserOrders);
router.get("/admin/all", controller.getAllOrders);
router.get("/analytics", controller.orderAnalytics);
router.put("/cancel/:order_id", controller.cancelOrder);
router.put("/update/:order_id", controller.updateOrder);
router.put("/:order_id", controller.updateStatus);
router.delete("/:order_id", controller.deleteOrder);
router.get("/:order_id", controller.getOrderDetails);

module.exports = router;
