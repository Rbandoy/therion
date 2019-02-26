import Sequelize from "../../db";

class SmartpaymayaCustomerAddress {
	static description = "Paymaya Requests Response";
	static tableName = 'smartpaymayacustomeraddresses';
	static attributes = {
		id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		houseNumber: Sequelize.STRING,
		street: Sequelize.STRING,
		barangay: Sequelize.STRING,
		city: Sequelize.STRING,
		province: Sequelize.STRING,
		zipcode: Sequelize.STRING,
		country: Sequelize.STRING,
		// createdAt: Sequelize.STRING,
		// updatedAt: Sequelize.STRING,
	};

	// static associations = {
	// 	senderAddress: {
	// 		type: "belongsTo",
	// 		model: "SmartpaymayaCustomerSender",
	// 		otherKey: "presentAddressId",
	// 		foreignKey: "id", 
	// 		// alias: "smartpaymayacustomeraddress",
	// 	},
	// };

};

export default SmartpaymayaCustomerAddress;