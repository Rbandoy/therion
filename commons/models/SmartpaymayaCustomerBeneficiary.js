import Sequelize from "../../db";
// import * as Enums from "../enums";
// const moment = require("moment");

class SmartpaymayaCustomerBeneficiary {
	static description = "Smart Paymaya Customer Beneficiary";
	static tableName = 'smartpaymayacustomerbeneficiaries';
	static attributes = {
		beneficiaryId: {
			type: Sequelize.INTEGER,
			// allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		registeredBy: {
			type: Sequelize.STRING,
			// allowNull: false,
			field: "registered_by",
		},
		firstName: Sequelize.STRING,
		middleName: Sequelize.STRING,
		lastName: Sequelize.STRING,
		addressId: {
			type: Sequelize.INTEGER,
			// allowNull: false,
		},
	};

	static associations = {
		beneficiaryAddress: {
			type: "belongsTo",
			model: "SmartpaymayaCustomerAddress",
			otherKey: "addressId",
			foreignKey: "addressId",
			alias: "beneficiaryAddress",
		},
	};
};

export default SmartpaymayaCustomerBeneficiary;
