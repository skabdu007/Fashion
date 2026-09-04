const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({

  shop_name: {
    type: String,
    required: true,
    trim: true
  },

  owner_name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,   // ✔ already creates index
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email"]
  },

  phone: {
    type: String,
    match: [/^[0-9]{10}$/, "Invalid phone number"]
  },

  address: {
    type: String,
    trim: true
  },

  password: {
    type: String,
    required: true,
    minlength: 4,
    select: false
  },

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "BLOCKED"],
    default: "PENDING"
  },

  lastLogin: {
    type: Date
  }

}, {
  timestamps: true
});


/* SAFE OBJECT */
vendorSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Vendor", vendorSchema);