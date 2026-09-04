const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Subscription = sequelize.define("Subscription", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  plan: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "ACTIVE"
  }
}, {
  tableName: "subscriptions",
  timestamps: true
});

module.exports = enhanceModel(Subscription);