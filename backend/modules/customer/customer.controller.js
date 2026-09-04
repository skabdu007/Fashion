const Customer = require("./customer.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// ==========================
// REGISTER
// ==========================
exports.register = async (req, res) => {
  try {

    const {
      username,
      nickname,
      email,
      address,
      phone,
      dob,
      password
    } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    const existing = await Customer.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      username,
      nickname,
      email,
      address,
      phone,
      dob,
      password: hashedPassword,
    });

    const safeCustomer = customer.toObject();
    delete safeCustomer.password;

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: safeCustomer
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


// ==========================
// LOGIN
// ==========================
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    if (customer.status === "BLOCKED") {
      return res.status(403).json({
        message: "Customer account blocked"
      });
    }

    const match = await bcrypt.compare(password, customer.password);

    if (!match) {
      return res.status(400).json({
        message: "Wrong password"
      });
    }

    customer.last_login = new Date();
    await customer.save();

    const token = jwt.sign(
      { id: customer._id, role: "CUSTOMER" },
      process.env.JWT_SECRET_CUSTOMER,
      { expiresIn: "1d" }
    );

    const safeCustomer = customer.toObject();
    delete safeCustomer.password;

    res.json({
      success: true,
      accessToken: token,
      customer: safeCustomer
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


// ==========================
// GET ALL (ADMIN)
// ==========================
exports.getAll = async (req, res) => {
  try {

    const customers = await Customer
      .find()
      .select("-password")
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: customers
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// GET ONE (OWNER / ADMIN)
// ==========================
exports.getOne = async (req, res) => {
  try {

    if (req.user.role === "CUSTOMER" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const customer = await Customer
      .findById(req.params.id)
      .select("-password");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      success: true,
      data: customer
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// UPDATE (OWNER / ADMIN)
// ==========================
exports.update = async (req, res) => {
  try {

    if (req.user.role === "CUSTOMER" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      success: true,
      message: "Customer updated",
      data: customer
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// DELETE (SUPER ADMIN)
// ==========================
exports.delete = async (req, res) => {
  try {

    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      success: true,
      message: "Customer deleted"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// BLOCK / UNBLOCK
// ==========================
exports.block = async (req, res) => {
  try {

    await Customer.findByIdAndUpdate(req.params.id, { status: "BLOCKED" });

    res.json({
      success: true,
      message: "Customer blocked"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unblock = async (req, res) => {
  try {

    await Customer.findByIdAndUpdate(req.params.id, { status: "ACTIVE" });

    res.json({
      success: true,
      message: "Customer activated"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// SEARCH
// ==========================
exports.search = async (req, res) => {
  try {

    const keyword = req.query.q || "";

    const customers = await Customer.find({
      username: { $regex: keyword, $options: "i" }
    }).select("-password");

    res.json({
      success: true,
      data: customers
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// ANALYTICS
// ==========================
exports.analytics = async (req, res) => {
  try {

    const [total, active, blocked] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: "ACTIVE" }),
      Customer.countDocuments({ status: "BLOCKED" })
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers: total,
        activeCustomers: active,
        blockedCustomers: blocked
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};