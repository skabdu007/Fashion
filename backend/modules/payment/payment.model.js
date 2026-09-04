const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({

  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },

  payment_type: {
    type: String,
    enum: ["DIRECT", "WALLET", "UPI", "CARD"],
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  payment_status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED"],
    default: "PENDING"
  },

  transaction_reference: String,

  created_at: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Payment", PaymentSchema);