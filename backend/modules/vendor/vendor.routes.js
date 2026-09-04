const express = require("express");
const router = express.Router();

const controller = require("./vendor.controller");
const Vendor = require("./vendor.model");

const {
  verifyToken,
  requireAdmin,
  authorizeRoles,
  ownerOrAdmin
} = require("../../middleware/auth");

router.post("/register", controller.register);
router.post("/login", controller.login);

router.get(
  "/profile",
  verifyToken,
  authorizeRoles("VENDOR"),
  controller.getProfile
);

router.put(
  "/:id/profile",
  verifyToken,
  ownerOrAdmin("id"),
  controller.update
);

router.get(
  "/",
  verifyToken,
  requireAdmin,
  controller.getAll
);

router.get(
  "/search",
  verifyToken,
  requireAdmin,
  controller.search
);

router.get(
  "/analytics",
  verifyToken,
  requireAdmin,
  controller.analytics
);

router.get(
  "/status/:status",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    try {
      const vendors = await Vendor.find({
        status: req.params.status.toUpperCase()
      }).select("-password");

      res.json({
        success: true,
        data: vendors
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

router.get(
  "/:id",
  verifyToken,
  requireAdmin,
  controller.getOne
);

router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  controller.update
);

router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  controller.delete
);

module.exports = router;
