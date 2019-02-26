import Controller from "../core/base/Controller";
import { DataManager } from "../globals";
import debug from "debug";
import PaymayServices from "../services/PaymayaServices";
// const Promise = require("bluebird");
// const moment = require("moment");
import BadRequest from "../core/base/BadRequest";
const log = debug("therion:server:SmartpaymayaCustomerBeneficiary");
// const CryptoJS = require("crypto-js");
import Sequelize from "../db";
const Op = Sequelize.Op;

class SmartpaymayaCustomerBeneficiary extends Controller {
	findOne = async (args) => {
		log("--------------------- findOne         ---------------------------- \n");
		try {

			let param = {};
			param["where"] = {
				[Op.and]: [
					Sequelize.where(Sequelize.fn("concat", Sequelize.col("firstName"), " ", Sequelize.col("lastName")), {
						like: "%" + args.where.name + "%",
					}),
					{ registeredBy: args.where.regcode },
				],
			};

			log("args.where.address : " + args.where.address);
			if (args.where.address && args.where.address === true) {
				param["include"] = [
					{
						model: DataManager._models.SmartpaymayaCustomerAddress,
						as: "beneficiaryAddress",
					},
				];
			}

			log(param["where"]);
			log(param["include"]);
			log("Param : " + JSON.stringify(param));

			return await this._model.findOne(param);

		} catch (error) {
			return error;
		}
	}

	// BACK-UP
	findAllAPI = async (args) => {
		log("--------------------- findAll         ---------------------------- \n");
		try {
			let senderDetails = [];
			if (args.where.name && args.where.name.length > 2) {
				let searchName = args.where.name.trim().split(" ");
				searchName = searchName.join("+");

				const data = {
					url: "beneficiary/" + args.where.regcode + "/?search=" + searchName,
					method: "GET",
					body: {},
				};

				log(data);

				const results = await PaymayServices.remittances("search", data);

				log("\n\n results");
				log(JSON.stringify(results));

				if (results.statusCode != 200) {
					throw new BadRequest("API Error");
				} else {

					if (results.body.length > 0) {

						results.body.forEach((beneficiary) => {
							let senderObj = {
								firstName: beneficiary.firstName,
								middleName: beneficiary.middleName,
								lastName: beneficiary.lastName,
								beneficiaryAddress: beneficiary.address,
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
		log("--------------------- findAll         ---------------------------- \n");
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
						as: "beneficiaryAddress",
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
			const { beneficiary, beneficiaryAddress, regcode } = args;
			beneficiary["registeredBy"] = regcode;

			// beneficiary["beneficiaryId"] = results.body.beneficiaryId;
			log(beneficiary);
			const addressDetails = await DataManager._models.SmartpaymayaCustomerAddress.create(
				beneficiaryAddress,
				{
					transaction,
				});

			log("\n Permanent Address \n");
			log(JSON.stringify(addressDetails));

			beneficiary["addressId"] = addressDetails.id;
			const beneficiaryDetails = await DataManager._models.SmartpaymayaCustomerBeneficiary.create(
				beneficiary,
				{
					transaction,
				});

			log({ beneficiaryDetails: JSON.stringify(beneficiaryDetails) });

			if (beneficiaryDetails) {
				log("------------------ COMMIT ---------------------");
				transaction.commit();
				return beneficiaryDetails;
			} else {
				transaction.rollback();
				// throw new BadRequest("cannt create beneficiary details");
				return {
					error: 1,
				};
			}

		} catch (error) {
			return error;
		}
	}
}

export default SmartpaymayaCustomerBeneficiary;

311229;