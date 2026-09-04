const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const OrderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  items: [OrderItemSchema],

  total_amount: {
    type: Number,
    required: true,
    min: 0
  },

  status: {
    type: String,
    enum: [
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED"
    ],
    default: "PENDING"
  },

  payment_method: {
    type: String,
    enum: ["WALLET", "UPI", "COD", "CARD", "BANKING"],
    default: "COD"
  },

  delivery_deadline: {
    type: Date,
    default: null
  },

  delivered_at: {
    type: Date,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
