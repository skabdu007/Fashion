const { sequelize, DataTypes, enhanceModel } = require("../../config/sequelize");

const Hosting = sequelize.define("Hosting", {
  _id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  auction_id: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  host_id: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "PENDING"
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "hostings",
  timestamps: true
});

module.exports = enhanceModel(Hosting);