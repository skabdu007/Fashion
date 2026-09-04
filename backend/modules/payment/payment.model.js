const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Payment = sequelize.define("Payment", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  payment_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: "PENDING"
  },
  transaction_reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "payments",
  timestamps: true
});

module.exports = enhanceModel(Payment);