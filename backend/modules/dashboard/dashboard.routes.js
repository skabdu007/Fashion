const express = require("express");

const router = express.Router();

const controller = require("./dashboard.controller");

const { verifyToken, requireSuperAdmin } = require("../../middleware/auth");

router.get(
  "/admin",
  verifyToken,
  requireSuperAdmin,
  controller.getAdminDashboard
);

module.exports = router;