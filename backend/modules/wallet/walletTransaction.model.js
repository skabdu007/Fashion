const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema({
  wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ["CREDIT", "DEBIT"],
    required: true
  },
  category: {
    type: String,
    enum: ["CASH", "CHIP", "ORDER", "REFUND", "SYSTEM"],
    default: "SYSTEM"
  },
  chip_type: {
    type: String,
    enum: ["BLUE", "GREEN", "YELLOW", "RED", "BLACK", null],
    default: null
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true, collection: "wallet_transactions" });

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
