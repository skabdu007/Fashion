const mongoose = require("mongoose");

const WonProductSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    index: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  auction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true
  },
  winning_bid: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ["won", "claimed", "delivered"],
    default: "won"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

WonProductSchema.index(
  { auction_id: 1, product_id: 1 },
  { unique: true, name: "unique_won_product_per_auction_item" }
);

module.exports = mongoose.model("WonProduct", WonProductSchema);
