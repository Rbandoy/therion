import Sequelize from "sequelize";

class FourmmRegistration {
  static description = "Unilevel Logs";
  static tableName = "fourmm_registration";
  static timestamps = false;
	static attributes = {
		regcode: {
      field: "reg_code",
			type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
		},
		accountType: {
      field: "account_type",
      type: Sequelize.STRING,
      allowNull: false,
		},
	};
};

export default FourmmRegistration;