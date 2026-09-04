const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email"]
  },

  password: {
    type: String,
    required: true,
    minlength: 4, // simple project ku ok
    select: false   // 🔥 hide password by default
  },

  full_name: {
    type: String,
    trim: true
  },

  phone: {
    type: String,
    match: [/^[0-9]{10}$/, "Invalid phone number"]
  },

  role: {
    type: String,
    enum: ["SUPER_ADMIN", "ADMIN"],
    default: "ADMIN"
  },

  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    default: "ACTIVE"
  },

  lastLogin: {
    type: Date
  }

}, {
  timestamps: true // 🔥 auto createdAt, updatedAt
});


/* ================= INDEX ================= */

// Faster email search
AdminSchema.index({ email: 1 });


/* ================= METHODS ================= */

// remove sensitive fields
AdminSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};


module.exports = mongoose.model("Admin", AdminSchema);