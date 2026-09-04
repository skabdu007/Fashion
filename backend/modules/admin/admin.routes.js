const express = require("express");
const router = express.Router();

const controller = require("./admin.controller");

const {
  verifyToken,
  requireAdmin,
  requireSuperAdmin
} = require("../../middleware/auth");

const {
  validateAdminRegister,
  validateLogin
} = require("../../middleware/validation");

/* ================= AUTH ================= */

// REGISTER
router.post("/register", validateAdminRegister, controller.register);

// LOGIN
router.post("/login", validateLogin, controller.login);

// LOGOUT
router.post("/logout", verifyToken, controller.logout);


/* ================= ADMIN CONTROL ================= */

// GET ALL CUSTOMERS
router.get("/customers",
  verifyToken,
  requireAdmin,
  controller.getAllCustomers
);

// GET ALL VENDORS
router.get("/vendors",
  verifyToken,
  requireAdmin,
  controller.getAllVendors
);

// CREATE ADMIN (SUPER ADMIN ONLY)
router.post("/create",
  verifyToken,
  requireSuperAdmin,
  controller.createAdmin
);


/* ================= VENDOR CONTROL ================= */

// APPROVE VENDOR
router.patch("/vendor/:id/approve",
  verifyToken,
  requireAdmin,
  controller.approveVendor
);

// BLOCK VENDOR
router.patch("/vendor/:id/block",
  verifyToken,
  requireAdmin,
  controller.blockVendor
);


/* ================= ADMIN CRUD ================= */

// GET ALL ADMINS
router.get("/",
  verifyToken,
  requireSuperAdmin,
  controller.getAllAdmins
);

// GET ONE ADMIN
router.get("/:id",
  verifyToken,
  requireSuperAdmin,
  controller.getAdminById
);

// UPDATE ADMIN
router.put("/:id",
  verifyToken,
  requireSuperAdmin,
  controller.updateAdmin
);

// DELETE ADMIN
router.delete("/:id",
  verifyToken,
  requireSuperAdmin,
  controller.deleteAdmin
);

module.exports = router;