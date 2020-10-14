import Sequelize from 'sequelize';

class ProviderRate {
  static tableName = "smartmoney_provider_rates_new";
  static timestamps = false;
  static attributes = {
    id: {
      type: Sequelize.INTEGER,
      // unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    startAmount: {
      type: Sequelize.DECIMAL,
      field: "start_amount",
    },
    endAmount: {
      type: Sequelize.INTEGER,
      field: "end_amount",
    },
    serviceCharge: {
      type: Sequelize.DECIMAL,
      field: "service_charge",
    },
    paymayaRevenue: {
      type: Sequelize.DECIMAL,
      field: "paymaya_revenue",
    },
    sendingAgent: {
      type: Sequelize.DECIMAL,
      field: "sending_agent",
    },
    receiveAgent: {
      type: Sequelize.DECIMAL,
      field: "receive_agent",
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: "2019-01-01"
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: "2019-01-01"
    },
  };

}

export default ProviderRate;