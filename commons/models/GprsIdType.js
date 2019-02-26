import Sequelize from "../../db";
// import * as Enums from "../enums";

class GprsIdType {
  static description = "Smart Paymaya Logs";
  static tableName = "gprs_id_types";
  static attributes = {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    description: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    // status: {
    //   type: Sequelize.ENUM(Enums.ON, Enums.OFF),
    //   // allowNull: false,
    //   defaultValue: Enums.NO,
    //   validate: {
    //     isIn: [[Enums.ON, Enums.OFF]],
    //   },
    // },
    // expirable: {
    //   type: Sequelize.ENUM(Enums.YES, Enums.NO),
    //   defaultValue: Enums.NO,
    //   // allowNull: false,
    //   validate: {
    //     isIn: [[Enums.YES, Enums.NO]],
    //   },
    // },
    // type: {
    //   type: Sequelize.STRING,
    //   // allowNull: false,
    //   field: "idType"
    // },
    clType: {
      type: Sequelize.STRING,
      // allowNull: false,
      field: "cl_type",
    },
  };
};

export default GprsIdType;