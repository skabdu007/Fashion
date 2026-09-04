const Vendor = require("./vendor.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (vendor) => {
  return jwt.sign(
    { id: vendor._id, role: "VENDOR" },
    process.env.JWT_SECRET_VENDOR,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { shop_name, owner_name, email, phone, address, password } = req.body;

    const existing = await Vendor.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = new Vendor({
      shop_name,
      owner_name,
      email,
      phone,
      address,
      password: hashedPassword,
      status: "PENDING"
    });

    await vendor.save();

    res.json({
      success: true,
      message: "Vendor Registered (Pending Approval)"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email }).select("+password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (vendor.status !== "APPROVED") {
      return res.status(403).json({ message: "Vendor not approved" });
    }

    let match = password === vendor.password;
    if (!match && vendor.password) {
      try {
        match = await bcrypt.compare(password, vendor.password);
      } catch {}
    }

    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    vendor.lastLogin = new Date();
    await vendor.save();

    const token = generateToken(vendor);

    const safeVendor = vendor.toObject ? vendor.toObject() : { ...vendor };
    delete safeVendor.password;

    res.json({
      success: true,
      accessToken: token,
      vendor: safeVendor
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const vendors = await Vendor.find().select("-password");

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
};

exports.getOne = async (req, res) => {
  const vendor = await Vendor.findById(req.params.id).select("-password");

  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found" });
  }

  res.json({
    success: true,
    data: vendor
  });
};

exports.update = async (req, res) => {
  const updateData = { ...req.body };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  ).select("-password");

  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found" });
  }

  res.json({
    success: true,
    message: "Vendor updated",
    data: vendor
  });
};

exports.delete = async (req, res) => {
  const vendor = await Vendor.findByIdAndDelete(req.params.id);

  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found" });
  }

  res.json({
    success: true,
    message: "Vendor deleted"
  });
};

exports.search = async (req, res) => {
  const keyword = req.query.q || "";

  const vendors = await Vendor.find({
    shop_name: {
      $regex: keyword,
      $options: "i"
    }
  }).select("-password");

  res.json({
    success: true,
    data: vendors
  });
};

exports.analytics = async (req, res) => {
  try {
    const totalVendors = await Vendor.countDocuments();
    const approved = await Vendor.countDocuments({ status: "APPROVED" });
    const blocked = await Vendor.countDocuments({ status: "BLOCKED" });
    const pending = await Vendor.countDocuments({ status: "PENDING" });

    res.json({
      success: true,
      data: {
        totalVendors,
        approved,
        blocked,
        pending
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({
      success: true,
      data: vendor
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({
      success: true,
      message: "Profile updated",
      data: vendor
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
