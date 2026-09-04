const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Customer = sequelize.define("Customer", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  raw_password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "ACTIVE"
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  orders_count: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  total_spent: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  bank_account: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      const raw = this.getDataValue("bank_account");
      if (!raw) return {};
      try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return {};
      }
    },
    set(val) {
      this.setDataValue("bank_account", typeof val === "object" ? JSON.stringify(val) : val);
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "customers",
  timestamps: true
});

module.exports = enhanceModel(Customer);
