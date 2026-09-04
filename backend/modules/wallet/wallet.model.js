const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Wallet = sequelize.define("Wallet", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    unique: true
  },
  red_chips: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  blue_chips: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  green_chips: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  yellow_chips: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  black_chips: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  cash_balance: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  transactions: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const raw = this.getDataValue("transactions");
      if (!raw) return [];
      try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue("transactions", typeof val === "object" ? val : JSON.parse(val || "[]"));
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "wallets",
  timestamps: true
});

module.exports = enhanceModel(Wallet);
