const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Auction = sequelize.define("Auction", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  room_code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  product_id: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  products: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const raw = this.getDataValue("products");
      if (!raw) return [];
      try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue("products", typeof val === "object" ? val : JSON.parse(val || "[]"));
    }
  },
  current_product_index: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  host_id: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  min_bid: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  bid_increment: {
    type: DataTypes.DOUBLE,
    defaultValue: 100
  },
  entry_fee: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  current_price: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  highest_bidder_id: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  highest_bidder_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  participants: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const raw = this.getDataValue("participants");
      if (!raw) return [];
      try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue("participants", typeof val === "object" ? val : JSON.parse(val || "[]"));
    }
  },
  chat_messages: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const raw = this.getDataValue("chat_messages");
      if (!raw) return [];
      try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue("chat_messages", typeof val === "object" ? val : JSON.parse(val || "[]"));
    }
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  turn_time_seconds: {
    type: DataTypes.DOUBLE,
    defaultValue: 60
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "UPCOMING"
  }
}, {
  tableName: "auctions",
  timestamps: true
});

module.exports = enhanceModel(Auction);
