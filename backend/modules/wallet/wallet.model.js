const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    unique: true
  },
  red_chips: {
    type: Number,
    default: 0
  },
  blue_chips: {
    type: Number,
    default: 0
  },
  green_chips: {
    type: Number,
    default: 0
  },
  yellow_chips: {
    type: Number,
    default: 0
  },
  black_chips: {
    type: Number,
    default: 0
  },
  cash_balance: {
    type: Number,
    default: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: "wallets"
});

WalletSchema.pre("save", function normalizeFields() {
  this.red_chips = Number(this.red_chips || 0);
  this.blue_chips = Number(this.blue_chips || 0);
  this.green_chips = Number(this.green_chips || 0);
  this.yellow_chips = Number(this.yellow_chips || 0);
  this.black_chips = Number(this.black_chips || 0);
  this.cash_balance = Number(this.cash_balance || 0);
});

module.exports = mongoose.model("Wallet", WalletSchema);
