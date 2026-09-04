const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Product = sequelize.define("Product", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vendor_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  category_id: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  stock: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sold_count: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  review_count: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  views: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "ACTIVE"
  },
  is_auction_exclusive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  auction_room_id: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  auction_availability: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "products",
  timestamps: true
});

module.exports = enhanceModel(Product);
