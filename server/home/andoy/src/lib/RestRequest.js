const requestHttp = require("request-promise");
// import debug from "debug";
// const log = debug("therion:server:RestRequest");
const RestRequest = {
	sendRequest: async (method, uri, headers = {}, body = {}, option = "") => {
		if (method == "GET" || option == "form") {
			body = { form: body };
		}

		try {
			const request = await requestHttp({
				method,
				json: true,
				headers,
				uri,
				body,
				resolveWithFullResponse: true,
			}).then(async (response) => {
				return response;
			}).catch((error) => {
				throw error;
			});

			return request;
		} catch (error) {
			throw error;
		}
	},

	sendRequestFormData: async (method, uri, headers = {}, body = {}) => {
		try {
			const request = await requestHttp({
				method,
				json: true,
				headers,
				uri,
				formData: body,
				resolveWithFullResponse: true,
			}).then(async (response) => {
				return response;
			}).catch((error) => {
				throw error;
			});

			return request;
		} catch (error) {
			throw error;
		}
	},


};

export default RestRequest;