import Controller from "../core/base/Controller";
import { DataManager } from "../globals";
import debug from "debug";
import PaymayServices from "../services/PaymayaServices";
// const Promise = require("bluebird");
const moment = require("moment");
// const dateFormat = require("dateformat");
import BadRequest from "../core/base/BadRequest";
const log = debug("therion:server:SmartpaymayaCustomerSender");
// const CryptoJS = require("crypto-js");
import Sequelize from "../db";
// import { constants } from "lib";
const Op = Sequelize.Op;

class SmartpaymayaCustomerSender extends Controller {
	findOne = async (args) => {
		log("--------------------- findOne         ---------------------------- \n");
		try {

			let param = {};
			param["where"] = {
				[Op.and]: [
					{ customerId: args.where.id },
					{ registeredBy: args.where.registeredBy },
				],
			};

			log("args.where.address : " + args.where.address);
			if (args.where.address && args.where.address === true) {
				param["include"] = [
					{
						model: DataManager._models.SmartpaymayaCustomerAddress,
						as: "senderAddress",
					},
				];
			}

			log("Param : " + JSON.stringify(param));

			return await this._model.findOne(param);

		} catch (error) {
			return error;
		}
	}

	findAllOld = async (args) => {
		log("--------------------- findAll         ---------------------------- \n");
		try {
			let senderDetails = [];
			if (args.where.name && args.where.name.length > 2) {
				let searchName = args.where.name.trim().split(" ");
				searchName = searchName.join("+");

				const data = {
					url: "sender/" + args.where.regcode + "/?search=" + searchName,
					method: "GET",
					body: {},
				};

				log({ data });

				const results = await PaymayServices.remittances("search", data);

				log({ results });

				if (results.statusCode != 200) {
					throw new BadRequest("API Error");
				} else {

					if (results.body.length > 0) {

						results.body.forEach((sender) => {
							let senderObj = {
								firstName: sender.firstName,
								middleName: sender.middleName,
								lastName: sender.lastName,
								senderAddress: sender.presentAddress,
								senderPermanentAddress: sender.permanentAddress,
							};

							log(senderObj);
							senderDetails.push(
								senderObj
							);
						});

					}
					return senderDetails;
				}

			} else {
				throw new BadRequest("Name length is less than 3 character.");
			}
		} catch (error) {
			return error;
		}
	}

	findAll = async (args) => {
		try {

			let param = {};

			param["where"] = {
				[Op.and]: [
					Sequelize.where(Sequelize.fn("concat", Sequelize.col("firstName"), " ", Sequelize.col("lastName")), {
						[Op.like]: "%" + args.where.name + "%",
					}),
					{ registeredBy: args.where.regcode },
				],
			};

			log("args.where.address : " + args.where.address);
			if (args.where.address && args.where.address === true) {
				param["include"] = [
					{
						model: DataManager._models.SmartpaymayaCustomerAddress,
						as: "senderPermanentAddress",
					},
				];
			}

			log(param["where"]);
			log(param["include"]);
			log("Param : " + JSON.stringify(param));

			return await this._model.findAll(param);



		} catch (error) {
			return error;
		}
	}

	findAndCountAll = async (args) => {
		log("--------------------- findAndCountAll ----------------------------");
		try {
			const queryWhere = {
				registerBy: args.where.regcode,
			};

			if (args.where.name.lenght > 2) {
				queryWhere.firstName = {
					[Op.like]: { firstName: args.where.name },
				};
			}

			return await this._model.findAll({
				where: queryWhere,
			});
		} catch (error) {
			return error;
		}
	}

	create = async (args) => {
		try {

			const transaction = await DataManager._manager.transaction();
			const { sender, senderAddress, regcode } = args;
			const permanentAddress = senderAddress.permanentAddress;
			// const presentAddress = senderAddress.presentAddress;


			log({ regcode });
			if (regcode == "" || regcode == undefined) {
				throw new BadRequest("No Regcode provided!");
			}
			let presentAddress = senderAddress.presentAddress;
			let presentAddressId = "";
			let permanentAddressId = "";
			let addressDetails = {};

			//------ 
			// sender["customerId"] = results.body.senderId;
			// permanentAddress["createdAt"] = `${moment().format("YYYY-MM-DD HH:mm:ss")}`;
			permanentAddress["updatedAt"] = `${moment().format("YYYY-MM-DD HH:mm:ss")}`;
			log({ permanentAddress });
			addressDetails = await DataManager._models.SmartpaymayaCustomerAddress.create(
				permanentAddress,
				{
					transaction,
				});

			log("\n Permanent Address \n");
			log(JSON.stringify(addressDetails));
			if (addressDetails) {
				permanentAddressId = addressDetails.id;

				addressDetails = await DataManager._models.SmartpaymayaCustomerAddress.create(
					presentAddress,
					{
						transaction,
					});
				log("\n Permanent Address \n");
				log(JSON.stringify(addressDetails));

				if (addressDetails) {
					presentAddressId = addressDetails.id;
				} else {
					transaction.rollback();
					// throw new BadRequest("error on permanentAddress");
					return {
						error: 1,
					};
				}

			} else {
				transaction.rollback();
				// throw new BadRequest("error on presentAddress");
				return {
					error: 1,
				};
			}

			sender["presentAddressId"] = presentAddressId;
			sender["permanentAddressId"] = permanentAddressId;
			sender["registeredBy"] = regcode;

			log("\n sender insert data \n");
			log(JSON.stringify(sender));

			let senderDetails = await DataManager._models.SmartpaymayaCustomerSender.create(
				sender,
				{
					transaction,
				});

			log({ senderDetaisl: JSON.stringify(senderDetails) });

			if (senderDetails) {
				log("------------------ COMMIT ---------------------");
				transaction.commit();

				log({ "sender": senderDetails });
				return senderDetails;
			} else {
				transaction.rollback();
				// throw new BadRequest("cannt create sender details");
				return {
					customerId: null,
				};
			}
			//------

		} catch (error) {
			log({ error });
			return error;
		}
	}

}

export default SmartpaymayaCustomerSender;