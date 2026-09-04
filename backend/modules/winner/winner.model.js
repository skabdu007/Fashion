const mongoose = require("mongoose");

const WinnerSchema = new mongoose.Schema({

  auction_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Auction"
  },

  product_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product",
    default:null
  },

  product_name:{
    type:String,
    default:""
  },

  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Customer"
  },

  winner_name:{
    type:String,
    default:""
  },

  winner_nickname:{
    type:String,
    default:""
  },

  winning_bid:Number,

  result_type:{
    type:String,
    enum:["SOLD","UNSOLD"],
    default:"SOLD"
  },

  wallet_settled: {
    type: Boolean,
    default: false
  },

  wallet_settled_at: {
    type: Date,
    default: null
  },

  declared_at:{
    type:Date,
    default:Date.now
  }

});

module.exports = mongoose.model("Winner",WinnerSchema);
