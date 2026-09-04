const Admin = require("./admin.model");
const Customer = require("../customer/customer.model");
const Vendor = require("../vendor/vendor.model");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const {
  successResponse,
  errorResponse
} = require("../../utils/responseFormatter");

//////////////////////////////////////////////////
// TOKEN
//////////////////////////////////////////////////

const generateAccessToken = (user) => {

  let secret;

  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    secret = process.env.JWT_SECRET_ADMIN;
  } else if (user.role === "CUSTOMER") {
    secret = process.env.JWT_SECRET_CUSTOMER;
  } else if (user.role === "VENDOR") {
    secret = process.env.JWT_SECRET_VENDOR;
  } else {
    throw new Error("Invalid role");
  }

  return jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRE || "1h" }
  );
};

//////////////////////////////////////////////////
// REGISTER
//////////////////////////////////////////////////

exports.register = async (req, res) => {
  try {

    const { username, email, password, full_name, phone, role } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email & password required", 400);
    }

    const existing = await Admin.findOne({ email });

    if (existing) {
      return errorResponse(res, "Email already exists", 400);
    }

    const admin = new Admin({
      username,
      email,
      password, // ✅ plain
      full_name,
      phone,
      role: role || "ADMIN"
    });

    await admin.save();

    const data = admin.toObject();
    delete data.password;

    return successResponse(res, "Admin registered successfully", data, 201);

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

//////////////////////////////////////////////////
// LOGIN
//////////////////////////////////////////////////

exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email & password required", 400);
    }

    const admin = await Admin.findOne({ email }).select("+password"); // ✅ FIX

    if (!admin) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    let match = admin.password === password;
    if (!match && admin.password) {
      try {
        match = await bcrypt.compare(password, admin.password);
      } catch {}
    }

    if (!match) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
      return errorResponse(res, "Access denied", 403);
    }

    const accessToken = generateAccessToken(admin);

    const data = admin.toObject();
    delete data.password;

    return successResponse(res, "Login successful", {
      accessToken,
      admin: data
    });

  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error", 500);
  }
};
//////////////////////////////////////////////////
// RESET PASSWORD
//////////////////////////////////////////////////

exports.resetPassword = async (req, res) => {
  try {

    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return errorResponse(res, "Email & new password required", 400);
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return errorResponse(res, "Admin not found", 404);
    }

    admin.password = newPassword; // ✅ plain
    await admin.save();

    return successResponse(res, "Password updated successfully");

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

//////////////////////////////////////////////////
// LOGOUT
//////////////////////////////////////////////////

exports.logout = async (req, res) => {
  return successResponse(res, "Logged out successfully");
};

//////////////////////////////////////////////////
// CREATE ADMIN
//////////////////////////////////////////////////

exports.createAdmin = async (req, res) => {
  try {

    const { username, email, password, full_name, phone, role } = req.body;

    const existing = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (existing) {
      return errorResponse(res, "Admin already exists", 400);
    }

    const admin = new Admin({
      username,
      email,
      password, // ✅ plain
      full_name,
      phone,
      role: role || "ADMIN"
    });

    await admin.save();

    return successResponse(res, "Admin created successfully", admin);

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

//////////////////////////////////////////////////
// UPDATE ADMIN
//////////////////////////////////////////////////

exports.updateAdmin = async (req, res) => {
  try {

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!admin) {
      return errorResponse(res, "Admin not found", 404);
    }

    return successResponse(res, "Admin updated", admin);

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

//////////////////////////////////////////////////
// GET ALL ADMINS
//////////////////////////////////////////////////

exports.getAllAdmins = async (req, res) => {

  const admins = await Admin.find();

  return successResponse(res, "Admins fetched", admins);

};

//////////////////////////////////////////////////
// GET ADMIN BY ID
//////////////////////////////////////////////////

exports.getAdminById = async (req, res) => {

  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    return errorResponse(res, "Admin not found", 404);
  }

  return successResponse(res, "Admin fetched", admin);

};

//////////////////////////////////////////////////
// UPDATE ADMIN
//////////////////////////////////////////////////

exports.updateAdmin = async (req, res) => {
  try {

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!admin) {
      return errorResponse(res, "Admin not found", 404);
    }

    return successResponse(res, "Admin updated", admin);

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
//////////////////////////////////////////////////
// DELETE ADMIN
//////////////////////////////////////////////////

exports.deleteAdmin = async (req, res) => {

  await Admin.findByIdAndDelete(req.params.id);

  return successResponse(res, "Admin deleted");

};

//////////////////////////////////////////////////
// REFRESH TOKEN
//////////////////////////////////////////////////

exports.refreshToken = async (req, res) => {

  try {

    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return errorResponse(res, "Invalid token", 401);
    }

    const newAccessToken = generateAccessToken(admin);

    return successResponse(res, "Token refreshed", {
      accessToken: newAccessToken
    });

  } catch {
    return errorResponse(res, "Invalid refresh token", 401);
  }

};

//////////////////////////////////////////////////
// GET CUSTOMERS
//////////////////////////////////////////////////

exports.getAllCustomers = async (req, res) => {

  const customers = await Customer.find();

  return successResponse(res, "Customers fetched", customers);

};

//////////////////////////////////////////////////
// GET VENDORS
//////////////////////////////////////////////////

exports.getAllVendors = async (req, res) => {

  const vendors = await Vendor.find();

  return successResponse(res, "Vendors fetched", vendors);

};


//////////////////////////////////////////////////
// APPROVE VENDOR
//////////////////////////////////////////////////

exports.approveVendor = async (req, res) => {
  try {

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status: "APPROVED" },
      { new: true }
    );

    if (!vendor) {
      return errorResponse(res, "Vendor not found", 404);
    }

    return successResponse(res, "Vendor approved", vendor);

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

//////////////////////////////////////////////////
// BLOCK VENDOR
//////////////////////////////////////////////////

exports.blockVendor = async (req, res) => {
  try {

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status: "BLOCKED" },
      { new: true }
    );

    if (!vendor) {
      return errorResponse(res, "Vendor not found", 404);
    }

    return successResponse(res, "Vendor blocked", vendor);

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
