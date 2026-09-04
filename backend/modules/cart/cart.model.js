const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Cart = sequelize.define("Cart", {
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
  status: {
    type: DataTypes.STRING,
    defaultValue: "ACTIVE"
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "carts",
  timestamps: true
});

module.exports = enhanceModel(Cart);