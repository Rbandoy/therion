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
		let paymayaURL = "https://pg-sandbox.paymaya.com/remittances/v2";
		let apiKey = "";
		// log("data.channel == \"smny\"");
		// log(data.body.channel == "smny");

		apiKey = "c2stMmRqTWtOaUNSbHlYaVEzcERxNUVyYlp1ZUVnMHllUllaRUw3U1d1TE5UMA==";

		const varHeader = {
			"Content-Type": "application/json",
			"Request-Reference-Number": data.requestReferenceNumber,
			Authorization: "Basic " + apiKey,
			"Client-id": "RSE21-GPRS-D2A",
		};

		log(` CREATING REMITTANCE - Sending  Request:
		Method: ${data.method}
		URL: ${paymayaURL}
		Headers: ${varHeader}
		Payload: ${JSON.stringify(data.body)}`);
		try {
			const result = await RestRequest.sendRequest(
				data.method,
				paymayaURL,
				varHeader,
				data.body
			);

			log(`REMITTANCE RESPONSE: SUCCESS
			Source: ${paymayaURL}
			Response: ${JSON.stringify(result.body)}
			`);
			return result;
		} catch (error) {

			log(`REMITTANCE RESPONSE: FAILED
			Source: ${paymayaURL}
			Response: ${JSON.stringify(error)}
			`);
			return error;
		}
	},

	executeRemittance: async (channel, requestReferenceNumber, transactionReferenceNumber) => {
		let paymayaURL = "https://pg-sandbox.paymaya.com/remittances/v2/" + transactionReferenceNumber + "/execute";
		let apiKey = "";
		log("channel : ", channel);

		if (channel == "smny") {
			apiKey = "c2stMmRqTWtOaUNSbHlYaVEzcERxNUVyYlp1ZUVnMHllUllaRUw3U1d1TE5UMA==";
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