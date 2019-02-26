import Sequelize from "../../db";

class GprsBillsPayment {
  static description = "GPRS Bills Payment Table";
  static tableName = "gprs_billspayment";

  static attributes = {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "rowID",
    },
    transNo: {
      type: Sequelize.INTEGER,
    },
    refNo: {
      type: Sequelize.STRING,
    },
    billerCode: {
      type: Sequelize.STRING,
    },
    institutionCode: {
      type: Sequelize.STRING,
    },
    acctNo: {
      type: Sequelize.STRING,
    },
    acctName: {
      type: Sequelize.STRING,
    },
    DisConDate: {
      type: Sequelize.STRING,
    },
    discount: {
      type: Sequelize.STRING,
    },
    cardno: {
      type: Sequelize.STRING,
    },
    areaCode: {
      type: Sequelize.STRING,
    },
    telNo: {
      type: Sequelize.STRING,
    },
    mobileNo: {
      type: Sequelize.STRING,
    },
    serviceRefNo: {
      type: Sequelize.STRING,
    },
    amount: {
      type: Sequelize.STRING,
    },
    sem: {
      type: Sequelize.STRING,
    },
    schoolyear: {
      type: Sequelize.STRING,
    },
    course: {
      type: Sequelize.STRING,
    },
    yearlevel: {
      type: Sequelize.STRING,
    },
    campus: {
      type: Sequelize.STRING,
    },
    rbccode: {
      type: Sequelize.STRING,
    },
    balance: {
      type: Sequelize.STRING,
    },
    bcol_done: {
      type: Sequelize.STRING,
    },
    bcol_date: {
      type: Sequelize.STRING,
    },
    bcol_time: {
      type: Sequelize.STRING,
    },
    remarks: {
      type: Sequelize.STRING,
    },
    sent: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
    },
    ip: {
      type: Sequelize.STRING,
    },
    terminalNo: {
      type: Sequelize.STRING,
    },
    trackno: {
      type: Sequelize.STRING,
    },
    provider_id: {
      type: Sequelize.STRING,
    },
    billNo: {
      type: Sequelize.STRING,
    },
    covered_from: {
      type: Sequelize.STRING,
    },
    covered_to: {
      type: Sequelize.STRING,
    },
  };


};

export default GprsBillsPayment;