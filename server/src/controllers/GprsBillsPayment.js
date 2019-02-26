import Controller from "../core/base/Controller";
import { DataManager } from "../globals";
import debug from "debug";
const log = debug("therion:server:SmartpaymayaCustomerBeneficiary");
import Sequelize from "../db";
const Op = Sequelize.Op;
class GprsBillsPayment extends Controller {
	findOne = async (args) => {
		log("---------------------findOne----------------------------\n");
		try {
			let param = {};
			param["where"] = {
				[Op.and]: [
					{ beneficiaryId: args.where.id },
					{ registeredBy: args.where.registeredBy },
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
}
export default GprsBillsPayment;