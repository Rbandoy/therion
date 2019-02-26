import Sequelize from "sequelize";

class SmartmoneyRate {
  static description = "Smart Paymaya Logs";
  static tableName = "smartmoney_rates";
  static timestamps = false;
  static attributes = {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    account_type: {
      type: Sequelize.STRING,
    },
    transtype: {
      type: Sequelize.STRING,
    },
    service_charge: {
      type: Sequelize.DECIMAL,

    },
    company_commission: {
      type: Sequelize.DECIMAL,

    },
    company_vat: {
      type: Sequelize.DECIMAL,

    },
    company_net_commission: {
      type: Sequelize.DECIMAL,

    },
    client_gross_income: {
      type: Sequelize.DECIMAL,

    },
    client_tax: {
      type: Sequelize.DECIMAL,

    },
    client_net_income: {
      type: Sequelize.DECIMAL,

    },
    unilevel_allocation: {
      type: Sequelize.DECIMAL,

    },
    unilevel_income: {
      type: Sequelize.DECIMAL,

    },
    unilevel_tax: {
      type: Sequelize.DECIMAL,

    },
    unilevel_net_income: {
      type: Sequelize.DECIMAL,

    },
    balanceBefore: {
      type: Sequelize.DECIMAL,

    },
    company_income: {
      type: Sequelize.DECIMAL,

    },
  };
};

export default SmartmoneyRate;