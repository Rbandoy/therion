import { DataManager } from "../globals";
import BadRequest from "../core/base/BadRequest";
import debug from "debug";
const log = debug("therion:server:TransactionService");
const moment = require("moment");
import RestRequest from "../lib/RestRequest";
const dateFormat = require("dateformat");
import PaymayaService from "../services/PaymayaServices";
import Notification from "../services/Notification";

import Sequelize from "../db";
const Op = Sequelize.Op;

import APIRequest from "../services/APIRequest";

const TransactionService = {
	generateTrackingNumber: (transactionCode, accountId) => {
		const generateCode = (length, subject) => {
			let hash = 0;
			let i;
			let chr;

			if (subject.length === 0) {
				return hash;
			}

			for (i = 0; i < subject.length; i++) {
				chr = subject.charCodeAt(i);
				hash = ((hash << 5) - hash) + chr;
				hash |= 0;
			}

			return (`000${hash}`).slice(Math.abs(length) * -1);
		};

		const stamp = String(Math.round((new Date()).getTime() / 1000));
		const stampBits = [];

		for (let i = 0; i < stamp.length; i++) {
			stampBits.push(stamp.charAt(i));
		}

		const stampGlue = [];

		for (let index = 0; index < 5; index++) {
			stampGlue.push(stampBits[Math.floor(Math.random() * stampBits.length)]);
		}

		return `UPS${String(transactionCode)}${stampGlue.join("")}${generateCode(5, `${accountId}${stampGlue.join("")}`)}`;
	},

	addUnilevel: async (regcode, amount, trackingNumber, ipAddress, transDescription = "REMIT") => {

		const data = [regcode, amount, 7, transDescription, trackingNumber, ipAddress].join("|");

		const isUnlievelLogExists = await DataManager._models.UnilevelLog.findOne({
			where: { trackingNumber },
		});

		const getTransNo = async (regcode) => {
			const report = await DataManager._models.GeneralReport.findOne({ where: { regcode }, order: [["transNo", "DESC"]] });
			return report ? report.transNo : 0;
		};

		if (isUnlievelLogExists) {
			throw new BadRequest("UNILEVEL ALREADY DISTRIBUTED");
		}

		const unilevelLogs = await DataManager._models.UnilevelLog.create(
			{ trackingNumber, details: data, status: 0 },
			{ returning: true }
		);

		try {
			const isRegistered = await DataManager._models.FourmmRegistration.findOne({
				where: { regcode },
			});

			if (!isRegistered) {
				throw new BadRequest("NO NETWORK - NO UNILEVEL ADDED");
			}

			let path = await DataManager._models.MpTree.findOne({
				where: { regcode },
			});

			if (!path) {
				throw new BadRequest("INVALID REGCODE");
			}

			path = path.path.split(",");
			path = path.slice(0, 10);

			const mpTrees = await DataManager._models.MpTree.findAll({
				where: {
					id: path,
				},
			});

			const regcodes = [];
			mpTrees.map((mpTree) => {
				if (mpTree.regcode !== regcode) {
					regcodes.push(mpTree.regcode);
				}
			});

			const fourmmRegistrations = await DataManager._models.FourmmRegistration.findAll({
				where: {
					regcode: regcodes,
				},
			});

			const multiTree = [];
			fourmmRegistrations.map((fourmmRegistration) => {
				multiTree.push(fourmmRegistration.accountType !== "GLOBAL" ? "RS000004" : fourmmRegistration.regcode);
			});

			const counts = Object.create(null);
			let regcodeList = [];
			multiTree.forEach(mt => {
				counts[mt] = counts[mt] ? counts[mt] + 1 : 1;
				regcodeList.push(mt);
			});

			regcodeList = regcodeList.filter((v, i, a) => a.indexOf(v) === i);

			log(regcodeList);
			const users = await DataManager._models.User.findAll({
				where: {
					regcode: regcodeList,
				},
			});

			const generalReportData = [];

			const date = moment().format("YYYY-MM-DD");
			const time = moment().format("HH:mm:ss");

			await Promise.all(users.map(async (user) => {
				generalReportData.push({
					transNo: await getTransNo(user.regcode) + 1,
					regcode: user.regcode,
					trackingNumber,
					transType: 18,
					date,
					time,
					ipAddress,
					amount: amount * counts[user.regcode],
					balanceBefore: parseFloat(user.ecashWallet),
					balanceAfter: parseFloat(user.ecashWallet) + (amount * counts[user.regcode]),
				});
			}));

			if (counts["RS000004"]) {
				generalReportData.push({
					transNo: await getTransNo("RS000004") + 1,
					regcode: "RS000004",
					trackingNumber,
					transType: 7,
					date,
					time,
					ipAddress,
					amount: amount * counts["RS000004"],
					balanceBefore: 0,
					balanceAfter: 0,
				});
			}

			log(generalReportData);

			await DataManager._models.GeneralReport.bulkCreate(generalReportData);
			log([DataManager._manager.literal(`ecashWallet + ${amount}`)]);
			await DataManager._models.User.update({
				ecashWallet: DataManager._manager.literal(`virtualvisa_fund + ${amount}`),
			}, {
				where: {
					regcode: regcodeList,
				},

			});


			await DataManager._models.UnilevelLog.update({
				remarks: "SUCCESS - UNILEVEL",
				status: 1,
			}, {
				where: {
					id: unilevelLogs.id,
				},
			});

			return counts;


		} catch (error) {

			log({ "addUnilevel": error });
			if (!unilevelLogs.status) {
				await DataManager._models.UnilevelLog.update({
					remarks: error.message,
					status: 0,
				}, {
					where: {
						id: unilevelLogs.id,
					},
				});
			}

			return error.message;
		}
	},

	generateUUID: () => {
		let d = new Date().getTime();

		if (typeof performance !== "undefined" && typeof performance.now === "function") {
			d += performance.now();
		}

		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			/* eslint-disable no-mixed-operators */
			const r = (d + Math.random() * 16) % 16 | 0;

			d = Math.floor(d / 16);

			return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
			/* eslint-enable */
		});
	},

	OTP: async (otpAction, request) => {
		const url = "http://35.187.230.79/sender/" + otpAction;

		const header = {
			"Content-Type": "application/json",
			"cache-control": "no-cache",
			"accept": "application/json",
		};

		const response = await RestRequest.sendRequestFormData("POST", url, header, request);
		log(JSON.stringify(response));
		if (response.body) {
			return response.body;
		} else {
			return response.response.body;
		}
	},

	unholdRemittance: async (parameters, request) => {
		let remittanceResponse = {};
		let expiryDate = "";

		if (request == 1) {
			const idDesc = {
				1: "Passport", 2: "Driver(s) License", 3: "PRC", 4: "UMID", 5: "NBI",
				6: "Police Clearance ID", 7: "Postal ID", 8: "Voters ID", 9: "Senior Citizen Card",
				10: "SSS", 11: "TIN", 12: "IBP", 13: "Seaman(s) Book ID", 14: "Firearms License",
				15: "School ID", 16: "Recidency ID", 17: "Cert of Registration",
			};

			const senderDetails = await DataManager._models.SmartpaymayaCustomerSender.findOne(
				{
					where: {
						customerId: parameters.sender,
					},
					include: [
						{
							model: DataManager._models.SmartpaymayaCustomerAddress,
							as: "senderAddress",
						},
						{
							model: DataManager._models.SmartpaymayaCustomerAddress,
							as: "senderPermanentAddress",
						},
					],
				}
			);

			log({ "senderDetails": JSON.stringify(senderDetails) });

			const beneficiaryDetails = await DataManager._models.SmartpaymayaCustomerBeneficiary.findOne(
				{
					where: {
						beneficiaryId: parameters.beneficiary,
					},
					include: [
						{
							model: DataManager._models.SmartpaymayaCustomerAddress,
							as: "beneficiaryAddress",
						},
					],
				}
			);

			log({ "beneficiaryDetails": JSON.stringify(beneficiaryDetails) });

			// const idDetails = await DataManager._models.IdRegistry.findOne(
			// 	{
			// 		where: {
			// 			id: parameters.senderId,
			// 		},
			// 	}
			// );

			const idDetails = await TransactionService.getIdDetails(parameters.senderId);

			log({ "idDetails": JSON.stringify(idDetails) });


			if ([3, 4, 8, 10, 11].includes(idDetails.type)) {
				expiryDate = "12/12/99";
			} else {
				expiryDate = moment(idDetails.expiry).format("MM/DD/YY");
			}
			const curdate = new Date();
			const fmtDate = dateFormat(curdate, "yyyy-mm-dd");
			const fmtTime = dateFormat(curdate, "HH:MM:ss.l");
			let data = {};
			data["requestReferenceNumber"] = TransactionService.generateUUID();
			data["method"] = "POST";
			data["body"] = {
				requestDatetime: `${fmtDate}T${fmtTime}+08:00`,
				countryOfOrigin: "PHL",
				sender: {
					name: {
						firstName: senderDetails.firstName,
						middleName: senderDetails.middleName,
						lastName: senderDetails.lastName,
					},
					id: {
						// type: idDesc.description,
						type: idDesc[idDetails.type],
						number: idDetails.number,
						expiryDate: expiryDate,
					},
					mobileNumber: `639${senderDetails.mobileNumber}`,
					nationality: senderDetails.nationality,
					birthDate: moment(senderDetails.birthDate).format("MM/DD/YYYY"),
					placeOfBirth: senderDetails.placeOfBirth,
					permanentAddress: {
						houseNumber: senderDetails.senderPermanentAddress.houseNumber,
						street: senderDetails.senderPermanentAddress.street,
						barangay: senderDetails.senderPermanentAddress.barangay,
						city: senderDetails.senderPermanentAddress.city,
						province: senderDetails.senderPermanentAddress.province,
						zipCode: senderDetails.senderPermanentAddress.zipcode,
						country: senderDetails.senderPermanentAddress.country,
					},
					sourceOfIncome: senderDetails.sourceOfIncome,
					occupation: senderDetails.occupation,
				},
				beneficiary: {
					name: {
						firstName: beneficiaryDetails.firstName,
						middleName: beneficiaryDetails.middleName,
						lastName: beneficiaryDetails.lastName,
					},
					address: {
						houseNumber: beneficiaryDetails.beneficiaryAddress.houseNumber,
						street: beneficiaryDetails.beneficiaryAddress.street,
						barangay: beneficiaryDetails.beneficiaryAddress.barangay,
						city: beneficiaryDetails.beneficiaryAddress.city,
						province: beneficiaryDetails.beneficiaryAddress.province,
						zipCode: beneficiaryDetails.beneficiaryAddress.zipcode,
						country: beneficiaryDetails.beneficiaryAddress.country,
					},
				},
				account: parameters.account,
				channel: parameters.channel,
				amount: {
					value: parameters.amount,
					currency: "PHP",
				},

				callbackUrl: "",
			};

			data["channel"] = parameters.channel;
			log("data-for-remitance : " + JSON.stringify(data));

			remittanceResponse = await PaymayaService.createRemittances(data);

			log("Create Remittance Response: ", JSON.stringify(remittanceResponse));
		} else if (request == 2) {
			remittanceResponse = await PaymayaService.executeRemittance(parameters.channel, parameters.requestReferenceNumber, parameters.referenceNumber);
			log({ "Execute Remittance Response: ": JSON.stringify(remittanceResponse) });
		}

		if (remittanceResponse.body) {
			return remittanceResponse.body;
		} else {
			return remittanceResponse.response.body;
		}
	},

	getCharge: async (userLevel, amount) => {
		// SmartmoneyProviderRates
		// SmartmoneyRates

		const charges = await DataManager._models.ProviderRate.findOne({
			where: {
				[Op.and]: {
					startAmount: { [Op.lte]: parseFloat(amount) },
					endAmount: { [Op.gte]: parseFloat(amount) },
				},
			},
		});
		let accounttype = "DLR";

		if (userLevel == 16) {
			accounttype = "ECC";
		} else if (userLevel == 7) {
			accounttype = "HUB";
		}

		log({ charges: JSON.stringify(charges) });
		return {
			charge: charges.serviceCharge,
			acount: accounttype,
		};

	},

	sendEmail: async (email, trackingNumber) => {
		const ratews = await DataManager._models.ProviderRate.findOne({ where: { id: 1 } });
		log({ rates: JSON.stringify(ratews) });

		try {
			await Notification.sendEmail({
				message: "<p>Thank you for sending remittance at Unified Products and Services </p>" +
					`<p>Please click on the link below to view your receipt: http://10.10.1.106:8004/portal/ecash_to_paymaya_receipt/${trackingNumber}</p>` +
					"<i><small>*If you are unable to click the link, please copy and paste the url in your browser.</small></i>",
				subject: "Remittance Transaction Receipt",
				email: email,
			});
			// log(ret);
		} catch (error) {
			log(error);
			throw new BadRequest(JSON.stringify(error));
		}
	},

	status: async (userLevel, totalAmount) => {
		let status = "OTP";

		if (userLevel != 6) {
			status = "POSTED";
		}

		if (totalAmount > 50000) {
			status = "FRAUD";
		}

		return status;
	},

	getIdDetails: async (idNumber) => {
		const url = "http://52.74.212.148:8092/ups_hotel_service_payment/idDetails";

		log({ idNumber });

		const idDetails = await APIRequest.sendServiceRequest(
			url,
			{ idNumber }
		);

		log({ idDetails: JSON.stringify(idDetails.body) });

		return idDetails.body;
	},


	logsTransactions: async ({ beneficiary, accountNumber, amount, remarks, status, ipAddress }) => {
		const beneficiaryDetails = await DataManager._models.SmartpaymayaCustomerBeneficiary.findOne(
			{ where: { beneficiaryId: beneficiary } });

		const logsDetails = {
			accountno: accountNumber,
			accoutname: `${beneficiaryDetails.firstName} ${beneficiaryDetails.middleName} ${beneficiaryDetails.lastName}`,
			amount: amount,
			remarks: remarks,
			status: status,
			ip: ipAddress,
		};

		await DataManager._models.RemittanceServicelog.create(logsDetails);

	},

	calculateIncome: async (amount, userLevel) => {
		const remitCharges = await DataManager._models.ProviderRate.findOne({
			where: {
				[Op.and]: {
					startAmount: { [Op.lte]: parseFloat(amount) },
					endAmount: { [Op.gte]: parseFloat(amount) },
				},
			},
		});

		const charges = remitCharges.sendingAgent;
		const vat = 1.12;
		const wht = 0.10;

		let unilevel = 0;
		let company_income = 0;
		let grossIncome = 0;
		let income = 0;
		let gprsWithholdingTax = 0;

		const incomePerc = (userLevel == 7 ? .7 : .6);
		const gprsVat = parseFloat((charges / vat) * 0.12).toFixed(2);
		const gprsNetVat = parseFloat(charges - gprsVat).toFixed(2);
		const outletGrossIncome = parseFloat(gprsNetVat * incomePerc).toFixed(2);

		if ([1, 6].includes(userLevel)) {
			unilevel = parseFloat(gprsNetVat * 0.1).toFixed(2);
			grossIncome = parseFloat(unilevel / 9).toFixed(2);
			gprsWithholdingTax = parseFloat(grossIncome * wht).toFixed(2);
			company_income = parseFloat(gprsNetVat - (grossIncome * 9)).toFixed(2);
			// income = grossIncome - gprsWithholdingTax;
		}

		if ([16, 7].includes(userLevel)) {
			grossIncome = outletGrossIncome;
			income = parseFloat(grossIncome - (grossIncome * wht)).toFixed(2);
			company_income = parseFloat(gprsNetVat - grossIncome).toFixed(2);
		}

		const data = { userLevel, charges, gprsVat, gprsNetVat, unilevel, grossIncome, gprsWithholdingTax, income, company_income };

		log({ calculateIncome: JSON.stringify(data) });
		return data;
	},
};

export default TransactionService;
