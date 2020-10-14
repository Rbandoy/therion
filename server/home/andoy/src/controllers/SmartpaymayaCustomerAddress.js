import Controller from "../core/base/Controller";
// import { DataManager } from "../globals";
import debug from "debug";
// import PaymayServices from "../services/PaymayaServices";
// import TransactionService from "../services/TransactionService";
// const Promise = require("bluebird");
// const moment = require("moment");
// import BadRequest from "../core/base/BadRequest";
// import Email from "../lib/Email";
const log = debug("therion:server:PaymayaController");
// const CryptoJS = require("crypto-js");
// import Sequelize from "../db";
// const Op = Sequelize.Op;

class SmartpaymayaLog extends Controller {
	findAll= async() => {
		let username = "jrlvaldez";
		return [{
			username,	
		}];
	}

	findOne = async(args) => {
		log(args);
	}
}

export default SmartpaymayaLog;
