const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Notification = sequelize.define("Notification", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  room_code: {
    type: DataTypes.STRING,
    allowNull: true
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
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "notifications",
  timestamps: true
});

module.exports = enhanceModel(Notification);
