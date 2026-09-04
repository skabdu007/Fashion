const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const WalletTransaction = sequelize.define("WalletTransaction", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  wallet_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  user_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chip_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metadata: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      const raw = this.getDataValue("metadata");
      if (!raw) return null;
      try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return raw;
      }
    },
    set(val) {
      this.setDataValue("metadata", typeof val === "object" ? JSON.stringify(val) : val);
    }
  }
}, {
  tableName: "wallettransactions",
  timestamps: true
});

module.exports = enhanceModel(WalletTransaction);
