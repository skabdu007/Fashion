const mongoose = require("mongoose");

const BidSchema = new mongoose.Schema({

  auction_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Auction"
  },

  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Customer"
  },

  bid_amount:Number,

  time:{
    type:Date,
    default:Date.now
  }

});

module.exports = mongoose.model("Bid",BidSchema);