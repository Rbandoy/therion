import Sequelize from "sequelize";

class UnilevelLog {
  static description = "Unilevel Logs";
  static tableName = "unilevel_logs";
  static attributes = {
    id: {
      field: "rowid",
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    trackingNumber: {
      field: "trackno",
      type: Sequelize.STRING,
      allowNull: false,
    },
    details: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    remarks: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
  };
};

export default UnilevelLog;