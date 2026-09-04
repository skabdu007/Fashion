const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Winner = sequelize.define("Winner", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  auction_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  product_id: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_id: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  winner_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  winner_nickname: {
    type: DataTypes.STRING,
    allowNull: true
  },
  winning_bid: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  result_type: {
    type: DataTypes.STRING,
    defaultValue: "SOLD"
  },
  wallet_settled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  wallet_settled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  declared_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "winners",
  timestamps: true
});

module.exports = enhanceModel(Winner);
