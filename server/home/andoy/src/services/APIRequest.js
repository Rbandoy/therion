import RestRequest from "../lib/RestRequest";
import debug from "debug";
const log = debug("therion:server:APIRequest");

const APIRequest = {
	sendServiceRequest: async (url, body) => {
		const varHeader = {
			"Content-Type": "application/json",
			"authorization": "Basic UGxlYXNld2FpdGZvcmNvbm5lY3Rpb25zdGF0dXM6cGxlYXNlKD48KXdhIXQ=",
			"cache-control": "no-cache",
			"postman-token": "b9654f9f-e353-7591-68d8-3d2854085c43",
		};

		try {
			const result = await RestRequest.sendRequestFormData("POST", url, varHeader, body);
			log(JSON.stringify(result));
			return result;
		} catch (error) {
			log("API ERROR on executeRemittance: ", JSON.stringify(error), "\n\n");
			return error;
		}
	},

};

export default APIRequest;