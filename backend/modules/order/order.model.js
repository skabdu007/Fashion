const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Order = sequelize.define("Order", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const raw = this.getDataValue("items");
      if (!raw) return [];
      try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue("items", typeof val === "object" ? val : JSON.parse(val || "[]"));
    }
  },
  total_amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "PENDING"
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: "WALLET"
  },
  delivery_deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "orders",
  timestamps: true
});

module.exports = enhanceModel(Order);
