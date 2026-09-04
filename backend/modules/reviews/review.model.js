const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Review = sequelize.define("Review", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  user_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  rating: {
    type: DataTypes.DOUBLE,
    defaultValue: 5
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "reviews",
  timestamps: true
});

module.exports = enhanceModel(Review);