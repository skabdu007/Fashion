const mongoose = require("mongoose");

const BankAccountSchema = new mongoose.Schema({
  account_holder_name: {
    type: String,
    trim: true,
    default: ""
  },
  account_number: {
    type: String,
    trim: true,
    default: ""
  },
  ifsc_code: {
    type: String,
    trim: true,
    uppercase: true,
    default: ""
  },
  bank_name: {
    type: String,
    trim: true,
    default: ""
  }
}, { _id: false });

const customerSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    trim: true
  },

  nickname: {
    type: String
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  address: {
    type: String
  },

  phone: {
    type: String
  },

  dob: {
    type: Date
  },

  // 🔒 HASHED PASSWORD
  password: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    default: "ACTIVE"
  },

  last_login: {
    type: Date
  },

  orders_count: {
    type: Number,
    default: 0
  },

  total_spent: {
    type: Number,
    default: 0
  },

  bank_account: {
    type: BankAccountSchema,
    default: () => ({})
  },

  created_at: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Customer", customerSchema);
