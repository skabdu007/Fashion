const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Wishlist = sequelize.define("Wishlist", {
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
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "wishlists",
  timestamps: true
});

module.exports = enhanceModel(Wishlist);