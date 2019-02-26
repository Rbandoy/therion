import RestRequest from "../lib/RestRequest";
// const CryptoJS = require("crypto-js");
import debug from "debug";
const log = debug("therion:server:PaymayaService");
// import { DataManager } from "../globals";
// import BadRequest from "../core/base/BadRequest";
// import RecordNotFound from "../core/base/RecordNotFound";
// const moment = require("moment");

const PaymayaService = {
	createRemittances: async (data) => {
		let paymayaURL = "https://pg-sandbox-kong.paymaya.com/remittances/v2";
		let apiKey = "";
		log("data.channel == \"smny\"");
		log(data.body.channel == "smny");

		// if (data.body.channel == "smny") {
		apiKey = "c2stUGdpdWd0OVFlUTdGUW5penZIUnV6ODVnZ3o5eVp2d2VWdzVyRlZNWXlxRA==";
		// }

		const varHeader = {
			"Content-Type": "application/json",
			"Request-Reference-Number": data.requestReferenceNumber,
			Authorization: "Basic " + apiKey,
		};

		log("Method : " + data.method + "\n URL : " + paymayaURL);
		log("var header : ", varHeader);
		log("\n\n BODY REQUEST", JSON.stringify(data.body), "\n\n BODY REQUEST END");
		try {
			const result = await RestRequest.sendRequest(
				data.method,
				paymayaURL,
				varHeader,
				data.body
			);

			log(result);
			log("\n\n\n\nResults from API " + paymayaURL + "\n\n\n\n");
			log(JSON.stringify(result));
			log("- -- -- - -  -- - END OF API REQUEST --------------------");
			return result;
		} catch (error) {
			log({ "API ERROR on createRemittances": JSON.stringify(error) });
			log("\n\n");
			return error;
		}
	},

	executeRemittance: async (channel, requestReferenceNumber, transactionReferenceNumber) => {
		let paymayaURL = "https://pg-sandbox-kong.paymaya.com/remittances/v2/" + transactionReferenceNumber + "/execute";
		let apiKey = "";
		log("channel : ", channel);

		if (channel == "smny") {
			apiKey = "c2stUGdpdWd0OVFlUTdGUW5penZIUnV6ODVnZ3o5eVp2d2VWdzVyRlZNWXlxRA==";
		}

		const varHeader = {
			"Content-Type": "application/json",
			"Request-Reference-Number": requestReferenceNumber,
			"transactionReferenceNumber": transactionReferenceNumber,
			Authorization: "Basic " + apiKey,
		};

		const body = {
			transactionReferenceNumber: transactionReferenceNumber,
		};

		log("Method : PUT \n\n", paymayaURL);
		log("var header ", varHeader);
		log("\n\n BODY REQUEST", JSON.stringify(body), "\n\n BODY REQUEST END");
		try {
			const result = await RestRequest.sendRequest("PUT", paymayaURL, varHeader, body);

			log("\n\n\n\nResults from API " + paymayaURL + "\n\n\n\n", JSON.stringify(result));
			log("- -- -- - -  -- - END OF API REQUEST --------------------");

			return result;
		} catch (error) {
			log("API ERROR on executeRemittance: ", JSON.stringify(error), "\n\n");
			return error;
		}
	},

};

export default PaymayaService;