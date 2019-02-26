import Sequelize from "sequelize";

class RemittanceServicelog {
  static description = "Smart Paymaya Logs";
  static tableName = "gprs_remittance_servicelogs";
  static timestamps = false;
  static attributes = {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "rowid",
    },
    accountno: {
      type: Sequelize.STRING,
    },
    accoutname: {
      type: Sequelize.STRING,
    },
    bankid: {
      type: Sequelize.TINYINT,
    },
    amount: {
      type: Sequelize.DECIMAL,
    },
    remarks: {
      type: Sequelize.STRING,
    },
    ip: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.TINYINT,
    },
    transType: {
      type: Sequelize.TINYINT,
      field: "type",
    },
    C2Btype: {
      type: Sequelize.TINYINT,
      field: "C2B_type",
    },
    createdAt: {
      type: Sequelize.DATE,
      field: "datetime",
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      field: "datetime",
    },
  };
};

export default RemittanceServicelog;