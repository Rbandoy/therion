import Sequelize from "../../db";
// import * as Enums from "../enums";
// const moment = require("moment");

class SmartpaymayaLog {
	static description = "Smart Paymaya Logs";
	static attributes = {
		rowid: {
			type: Sequelize.INTEGER,
			// allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		regcode: {
			type: Sequelize.STRING,
			// allowNull: false,
		},
		trackingNumber: {
			type: Sequelize.STRING,
		},
		requestReferenceNumber: {
			type: Sequelize.STRING,
			// allowNull: false,
		},
		referenceNumber: {
			type: Sequelize.STRING,
			// allowNull: false,
		},
		account: {
			type: Sequelize.STRING,
			// allowNull: false,
		},
		// channel: {
		// 	type: Sequelize.ENUM(Enums.SMNY, Enums.PICKUP, Enums.PYMY),
		// 	// allowNull: false,
		// 	validate: {
		// 		isIn: [[Enums.SMNY, Enums.PICKUP, Enums.PYMY]],
		// 	},
		// },
		channel: {
			type: Sequelize.STRING,
			// allowNull: false,
		},
		amount: {
			type: Sequelize.DECIMAL,
			// allowNull: false,
		},
		sender: {
			type: Sequelize.INTEGER,
			// allowNull: false,
		},
		beneficiary: {
			type: Sequelize.INTEGER,
			// allowNull: false,
		},
		senderId: {
			type: Sequelize.STRING,
			// allowNull: false,
		},
		charge: {
			type: Sequelize.DECIMAL,
			// allowNull: false,
		},
		status: {
			type: Sequelize.STRING,
			// allowNull: false,
		},
		ip: {
			type: Sequelize.STRING,
			// allowNull: false,
		},
		balanceBefore: {
			type: Sequelize.DECIMAL,
			// allowNull: false,
		},
		balanceAfter: {
			type: Sequelize.DECIMAL,
			// allowNull: false,
		},
		remarks: {
			type: Sequelize.STRING,
			// allowNull: false,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedAt: {
			type: Sequelize.DATE,
		}
	};

	static associations = {
		senderDetails: {
			type: "belongsTo",
			model: "SmartpaymayaCustomerSender",
			foreignKey: "sender",
			otherKey: "customerId",
			alias: "senderDetails"
		},
		beneficiaryDetails: {
			type: "belongsTo",
			model: "SmartpaymayaCustomerBeneficiary",
			foreignKey: "beneficiary",
			otherKey: "beneficiaryId",
			alias: "beneficiaryDetails"
		},
	};
};

export default SmartpaymayaLog;