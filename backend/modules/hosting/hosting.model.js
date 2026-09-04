const mongoose = require("mongoose");

const HostingSchema = new mongoose.Schema({

  auction_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Auction"
  },

  host_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Admin"
  },

  status:{
    type:String,
    enum:["WAITING","LIVE","ENDED"],
    default:"WAITING"
  },

  started_at:Date,
  ended_at:Date

});

module.exports = mongoose.model("Hosting",HostingSchema);