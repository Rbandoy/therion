import Sequelize from "../../db";

class IdRegistry {
  static description = "gprs id list registry";
  static tableName = "gprs_id_registry";
  static attributes = {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    regcode: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    firstName: {
      type: Sequelize.STRING,
    },
    middleName: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    birthDate: {
      type: Sequelize.DATE,
      // allowNull: false, 
    },
    number: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    type: {
      type: Sequelize.INTEGER,
      // allowNull: false,
    },
    expiry: {
      type: Sequelize.DATE,
      // allowNull: false,
    },
    // status: {
    //   type: Sequelize.ENUM(Enums.POSTED, Enums.APPROVED, Enums.REVOKED, Enums.RENEW),
    //   // allowNull: false,
    //   validate: {
    //     isIn: [[Enums.POSTED, Enums.APPROVED, Enums.REVOKED, Enums.RENEW]],
    //   },
    // }
  };
};

export default IdRegistry;