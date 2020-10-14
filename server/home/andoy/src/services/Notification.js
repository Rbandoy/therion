import Mailjet from "node-mailjet";

import security from "../config/security";

import debug from "debug";
const log = debug("therion:server:TransactionService");

class Notification {
	sendEmail = async ({ message, subject, email }) =>
		new Promise(async (resolve, reject) => {

			const { mailjet: { apiKey, apiSecret, source, sender } } = security;

			const mailjet = Mailjet.connect(apiKey, apiSecret);

			log(mailjet);
			try {
				mailjet.post("send")
					.request({
						"FromEmail": sender,
						"FromName": source,
						"Subject": subject,
						"Html-part": message,
						"Recipients": [{ "Email": email }],
					})
					.then((r) => resolve(r))
					.catch((e) => reject(e));
			} catch (error) {
				return error;
			}
		})
}

export default new Notification();
