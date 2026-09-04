const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({

  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  },

  rating: {
    type: Number,
    min: 1,
    max: 5
  },

  comment: String,

  created_at: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Review", ReviewSchema);