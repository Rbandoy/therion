import Sequelize from 'sequelize';

class GeneralReport {
  static tableName = "gprs_generalreport";
  static attributes = {
    id: {
      type: Sequelize.INTEGER,
      field: "rowID",
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    transNo: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    regcode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    trackingNumber: {
      type: Sequelize.STRING,
      field: "trackingNo",
      allowNull: false,
    },
    transType: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    charge: {
      type: Sequelize.FLOAT,
    },
    income: {
      type: Sequelize.FLOAT,
      // allowNull: false,
    },
    companyIncome: {
      field: "company_income",
      type: Sequelize.FLOAT,
    },
    balanceBefore: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    balanceAfter: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    ipAddress: {
      field: "ip",
      type: Sequelize.STRING,
    },
  };
}

export default GeneralReport;