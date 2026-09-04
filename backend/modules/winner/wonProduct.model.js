const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const WonProduct = sequelize.define("WonProduct", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  product_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  auction_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  winning_bid: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "WON"
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "wonproducts",
  timestamps: true
});

module.exports = enhanceModel(WonProduct);
