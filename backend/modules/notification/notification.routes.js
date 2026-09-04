const express = require("express");

const router = express.Router();

const controller = require("./notification.controller");

router.post("/", controller.createNotification);
router.post("/auction", controller.sendAuctionNotification);
router.get("/unread-count/:user_id", controller.getUnreadCount);
router.put("/mark-read/:id", controller.markAsRead);
router.put("/mark-read-all/:user_id", controller.markAllAsRead);
router.get("/:user_id", controller.getUserNotifications);

module.exports = router;
