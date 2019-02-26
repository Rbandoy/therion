import Controller from "../core/base/Controller";
// import { DataManager } from "../globals";
import debug from "debug";
import PaymayServices from "../services/PaymayaServices";
// import TransactionService from "../services/TransactionService";
// const Promise = require("bluebird");
// const moment = require("moment");
// import BadRequest from "../core/base/BadRequest";
// import Email from "../lib/Email";
const log = debug("therion:server:PaymayaController");
// const CryptoJS = require("crypto-js");
// import Sequelize from "../db";
// const Op = Sequelize.Op;

class Paymaya extends Controller {
	generateReferenceId = async (args) => {
		const {data} = args;
		// let result = "failed";
		
		const generateUUID = () => {
			// let d = new Date().getTime();
			// // data = data;
			// // if (typeof performance !== "undefined" && typeof performance.now === "function"){
			// // 	d += performance.now();
			// // }
	
			// return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			// 	/* eslint-disable no-mixed-operators */
			// 	const r = (d + Math.random() * 16) % 16 | 0;
	
			// 	d = Math.floor(d / 16);
	
			// 	return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
			// 	/* eslint-enable */
			// });

			return "XXXXXX";
		};
	
		// const data = {};
		// data.referenceId = generateUUID;
	
		// return data;

		if (data.type == "remit") {
			return generateUUID();
		} else {
			return "01221";
		}
		
	}

	findAll= async() => {
		
		let username = "jrlvaldez";
		return [{
			username,	
		}];
	}

	findOne = async(args) => {
		log("test log \n");
		log(args + "\n");
		let remitanceReferenceNumber = "return test";
		// const remitanceReferenceNumber = this._model.generateReferenceId({type:"remit"});
		// log(remitanceReferenceNumber);

		// let remitResult = await PaymayServices.remittances("remit", data);

		// if (remitResult == "success") {
		// 	remitResult = await PaymayServices.remittances("webhookRemittance", data);
		// 	if (remitResult == "success") {
		// 		result = "";
		// 	}
		// }
		log(JSON.stringify(args) + "\n");
		log("---------------" + args.where.regcode + "-------------");
		const results = await PaymayServices.remittances(args.where.process, args.where.details);
		return {username:remitanceReferenceNumber, trackingNumber:remitanceReferenceNumber, results:results};
	}



}

export default Paymaya;
