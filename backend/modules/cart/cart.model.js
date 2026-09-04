const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({

  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  quantity: {
    type: Number,
    default: 1
  },

  price: Number

});

const CartSchema = new mongoose.Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  items: [CartItemSchema],

  status: {
    type: String,
    default: "ACTIVE"
  },

  created_at: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Cart", CartSchema);