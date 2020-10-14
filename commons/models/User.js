import Sequelize from "../../db";

class User {
	static description = "System user";
	static tableName = "gprs_userdetails";
	static attributes = {
		id: {
			type: Sequelize.INTEGER,
			field: "rowid",
			unique: true,
			allowNull: false,
			primaryKey: true,
		},
		regcode: {
			type: Sequelize.STRING,
			unique: true,
			allowNull: false,
		},
		username: {
			type: Sequelize.STRING,
			unique: true,
			allowNull: false,
		},
		emailAddress: {
			type: Sequelize.STRING,
			field: "emailadd",
			unique: true,
			allowNull: false,
			validate: {
				isEmail: true,
			},
		},
		ecashWallet: {
			type: Sequelize.FLOAT,
			field: "virtualvisa_fund",
		},
		mobileNumber: {
			field: "mobileno",
			type: Sequelize.STRING,
			unique: true,
			allowNull: false,
		},
		transactionPassword: {
			type: Sequelize.STRING,
			field: "password2",
			allowNull: false,
		},
		firstName: {
			type: Sequelize.STRING,
			field: "fname",
			allowNull: false,
		},
		middleName: {
			type: Sequelize.STRING,
			field: "mname",
		},
		lastName: {
			type: Sequelize.STRING,
			field: "lname",
			allowNull: false,
		},
		companyGroup: {
			type: Sequelize.STRING,
			field: "company_group",
			allowNull: false,
		},
		userlevel: Sequelize.INTEGER,
	};
}

export default User;
