
const datastore = {
	test: {
		dialect: "sqlite",
		host: "sqlite",
		name: "db.therion.sqlite",
		username: null,
		password: null,
		location: "../..",
		timezone: "+08:00",
	},

	development: {
		dialect: "mysql",
		host: "35.197.142.149",
		name: "gprsnetwork",
		username: "joseph_it",
		password: "joseph123*()",
		timezone: "+08:00",
	},

	development1: {
		dialect: "mysql",
		host: "35.200.226.111",
		name: "gprsnetwork",
		username: "joseph",
		password: "joSeph$#@!",
		timezone: "+08:00",
	},

	production: {
		dialect: process.env.DB_DIALECT || "mysql",
		host: process.env.DB_HOST || "localhost",
		name: process.env.DB_NAME || "therion",
		username: process.env.DB_USERNAME || "root",
		password: process.env.DB_PASSWORD || "root",
	},

	//
	// safe - Do not touch the database
	// alter - Alters tables to fit models
	// drop - Deletes tables before re-creating it
	//
	mode: "safe",

	modelSequence: [
		"User",
		"SmartpaymayaCustomerAddress",
		"SmartpaymayaCustomerSender",
		"SmartpaymayaCustomerBeneficiary",
		"SmartpaymayaLog",
		"IdRegistry",
		"GprsIdType",
		"GeneralReport",
		"MpTree",
		"UnilevelLog",
		"FourmmRegistration",
		"ProviderRate",
		"SmartmoneyRate",
		"RemittanceServicelog",
	],
};

module.exports = datastore;
