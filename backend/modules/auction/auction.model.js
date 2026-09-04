const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  username: {
    type: String,
    required: true
  },
  wallet_balance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["ACTIVE", "FOLDED"],
    default: "ACTIVE"
  },
  folded_reason: {
    type: String,
    default: ""
  },
  last_bid_amount: {
    type: Number,
    default: 0
  },
  joined_at: {
    type: Date,
    default: Date.now
  },
  folded_at: Date
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const AuctionProductSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  product_name: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  base_price: {
    type: Number,
    default: 0
  },
  min_bid: {
    type: Number,
    default: 0
  },
  current_price: {
    type: Number,
    default: 0
  },
  highest_bidder_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    default: null
  },
  highest_bidder_name: {
    type: String,
    default: ""
  },
  highest_bidder_nickname: {
    type: String,
    default: ""
  },
  winner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    default: null
  },
  winner_name: {
    type: String,
    default: ""
  },
  winner_nickname: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["PENDING", "LIVE", "SOLD", "UNSOLD"],
    default: "PENDING"
  },
  sold_at: Date
}, { _id: false });

const AuctionSchema = new mongoose.Schema({

  room_code: {
    type: String,
    unique: true
  },

  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null
  },

  products: {
    type: [AuctionProductSchema],
    default: []
  },

  current_product_index: {
    type: Number,
    default: 0
  },

  host_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },

  min_bid: Number,
  bid_increment: {
    type: Number,
    default: 100
  },
  entry_fee: Number,
  current_price: {
    type: Number,
    default: 0
  },
  highest_bidder_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    default: null
  },
  highest_bidder_name: {
    type: String,
    default: ""
  },
  participants: {
    type: [ParticipantSchema],
    default: []
  },
  chat_messages: {
    type: [MessageSchema],
    default: []
  },

  start_time: Date,
  end_time: Date,
  turn_time_seconds: {
    type: Number,
    default: 60
  },

  status: {
    type: String,
    enum: ["UPCOMING","LIVE","ENDED"],
    default: "UPCOMING"
  }

},{timestamps:true});

module.exports = mongoose.model("Auction",AuctionSchema);
