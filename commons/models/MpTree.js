import Sequelize from "sequelize";

class MpTree {
  static description = "Fourmm MP Tree";
  static tableName = "fourmm_mp_tree";
  static timestamps = false;
	static attributes = {
		regcode: {
      field: "reg_code",
			type: Sequelize.STRING,
			allowNull: false,
		},
		path: {
      type: Sequelize.STRING,
      allowNull: false,
		},
	};
};

export default MpTree;