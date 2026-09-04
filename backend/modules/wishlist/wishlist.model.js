const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  created_at: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Wishlist", WishlistSchema);