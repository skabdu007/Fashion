const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({

  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },

  name: {
    type: String,
    required: true
  },

  description: String,

  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE"
  },

  created_at: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Category", CategorySchema);