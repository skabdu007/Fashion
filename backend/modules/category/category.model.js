const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Category = sequelize.define("Category", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  parent_id: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "ACTIVE"
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "categorys",
  timestamps: true
});

module.exports = enhanceModel(Category);