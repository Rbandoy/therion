import Sequelize from "sequelize";

class SmartpaymayaCustomerSender {
	static description = "Smart Paymaya Sender";
	static tableName = 'smartpaymayacustomersenders';
	static attributes = {
		customerId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		registeredBy: {
			type: Sequelize.STRING,
			// allowNull: false,
			field: "registered_by"
		},
		firstName: {
			type: Sequelize.STRING,
		},
		middleName: {
			type: Sequelize.STRING,
		},
		lastName: {
			type: Sequelize.STRING,
		},
		mobileNumber: {
			type: Sequelize.STRING,
		},
		birthDate: {
			type: Sequelize.STRING,
		},
		nationality: {
			type: Sequelize.STRING,
		},
		placeOfBirth: {
			type: Sequelize.STRING,
		},
		sourceOfIncome: {
			type: Sequelize.STRING,
		},
		occupation: {
			type: Sequelize.STRING,
		},
		presentAddressId: {
			type: Sequelize.INTEGER,
		},
		permanentAddressId: {
			type: Sequelize.INTEGER,
		},
		// createdAt: {
		// 	type: Sequelize.STRING,
		// },
		// updatedAt: {
		// 	type: Sequelize.STRING,
		// }
	};

	static associations = {
		senderAddress: {
			type: "belongsTo",
			model: "SmartpaymayaCustomerAddress",
			otherKey: "presentAddressId",
			foreignKey: "presentAddressId",
			alias: "senderAddress",
		},
		senderPermanentAddress: {
			type: "belongsTo",
			model: "SmartpaymayaCustomerAddress",
			otherKey: "permanentAddressId",
			foreignKey: "permanentAddressId",
			alias: "senderPermanentAddress",
		},
	};
};

export default SmartpaymayaCustomerSender;