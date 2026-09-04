const express = require("express");
const router = express.Router();

const controller = require("./customer.controller");

const { verifyToken, authorizeRoles } = require("../../middleware/auth");

// ==========================
// 🔐 PUBLIC ROUTES
// ==========================
router.post("/register", controller.register);
router.post("/login", controller.login);

// ==========================
// 📊 ADMIN ROUTES
// ==========================
router.get(
  "/analytics",
  verifyToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  controller.analytics
);

router.get(
  "/search",
  verifyToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  controller.search
);

router.get("/:id/bank-account", verifyToken, controller.getBankAccount);
router.put("/:id/bank-account", verifyToken, controller.updateBankAccount);

router.put(
  "/block/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  controller.block
);

router.put(
  "/unblock/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  controller.unblock
);

// ==========================
// 📦 CRUD ROUTES
// ==========================

// 👉 GET ALL (admin only)
router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  controller.getAll
);

// 👉 GET ONE (owner OR admin)
router.get("/:id", verifyToken, controller.getOne);

// 👉 UPDATE (owner OR admin)
router.put("/:id", verifyToken, controller.update);

// 👉 DELETE (only super admin)
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("SUPER_ADMIN"),
  controller.delete
);

module.exports = router;
