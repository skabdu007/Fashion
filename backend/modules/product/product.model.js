const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },
  product_name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  image: String,
  sold_count: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  review_count: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE"
  },
  is_auction_exclusive: {
    type: Boolean,
    default: false
  },
  auction_room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    default: null
  },
  auction_availability: {
    type: String,
    enum: ["AVAILABLE", "RESERVED", "SOLD"],
    default: "AVAILABLE"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Product", ProductSchema);
