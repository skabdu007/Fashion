const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  plan: {
    type: String,
    enum: ["SILVER", "GOLD", "PLATINUM"],
    required: true
  },

  start_date: {
    type: Date,
    default: Date.now
  },

  end_date: {
    type: Date
  },

  status: {
    type: String,
    enum: ["ACTIVE", "EXPIRED"],
    default: "ACTIVE"
  }

});

module.exports = mongoose.model("Subscription", SubscriptionSchema);