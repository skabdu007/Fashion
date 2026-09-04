const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Admin = sequelize.define("Admin", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "ADMIN"
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "ACTIVE"
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "admins",
  timestamps: true
});

module.exports = enhanceModel(Admin);