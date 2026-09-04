const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Vendor = sequelize.define("Vendor", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shop_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  owner_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "PENDING"
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "vendors",
  timestamps: true
});

module.exports = enhanceModel(Vendor);