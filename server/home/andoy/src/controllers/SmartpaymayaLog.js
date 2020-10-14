import Controller from "../core/base/Controller";
import { DataManager } from "../globals";
import debug from "debug";
// import PaymayaService from "../services/PaymayaServices";
import TransactionService from "../services/TransactionServices";
// import SmsSender from "../controllers/smsSender";
// import BadRequest from "../core/base/BadRequest";
// const moment = require("moment");
const log = debug("therion:server:SmartpaymayaLog--");
// const dateFormat = require("dateformat");
const CryptoJS = require("crypto-js");
const moment = require("moment-timezone");

class SmartpaymayaLog extends Controller {

	findAll = async () => {
	}

	findOne = async (args) => {

		// const transaction = await DataManager._manager.transaction();
		const regcode = args.where.regcode;
		log("args.where : " + JSON.stringify(args.where));

		if (args.where.process == "resendotp") {
			log("-== resend OTP ==-");

			const verifyResponse = await TransactionService.OTP("resend_otp", {
				"trackno": args.where.trackingNumber,
				"regcode": args.where.regcode,
				"ip": args.where.ipAddress,
			});

			log("verifyResponse", JSON.stringify(verifyResponse));

			if (verifyResponse.status && verifyResponse.status == 1) {
				return {
					status: verifyResponse.status,
					remarks: verifyResponse.M,
				};
			} else {
				return {
					status: 0,
					remarks: "an error occur while resending your OTP. Please try again.",
				};
			}
		} else if (args.where.process == "unhold") {
			const transaction = await DataManager._manager.transaction();
			const where = { where: { trackingNumber: args.where.trackingNumber, regcode } };
			const user = await DataManager._models.User.findOne({ where: { regcode } });
			let verifyResponse;
			 
			if (!user) {
				throw new Error("User not found.");
			}

			if (args.where.verificationCode) {

				verifyResponse = await TransactionService.OTP("verify_otp", {
					"trackno": args.where.trackingNumber,
					"regcode": regcode,
					"v_code": args.where.verificationCode,
				});
				log("verifyResponse : ", JSON.stringify(verifyResponse));

				if (verifyResponse.status != 1) {
					log("invalid pass");
					return {
						status: "OTP",
						remarks: verifyResponse.M,
					};
				}
			}

			let balanceToPay = 0;
			const paymayalog = await DataManager._models.SmartpaymayaLog.findOne({ where: { trackingNumber: args.where.trackingNumber } });
			const unilevelData = await TransactionService.calculateIncome(paymayalog.amount, user.userlevel);
			const logsDetails = {
				beneficiary: paymayalog.beneficiary,
				accountNumber: paymayalog.account,
				amount: paymayalog.amount,
				ipAddress: paymayalog.ip,
				transType: 1,
				status: 0,
			};

			if ([1, 6].includes(user.userlevel)) {
				balanceToPay = parseFloat(paymayalog.amount) + parseFloat(paymayalog.charge);
			} else {
				balanceToPay = (parseFloat(paymayalog.amount) + parseFloat(paymayalog.charge));
			}
			log("===================================check balance UNHOLD: user balance" + user.ecashWallet + "   BALANCE TO PAY: "+ balanceToPay);
			log("paymayalog : " + JSON.stringify(paymayalog));
			if (parseFloat(user.ecashWallet) < parseFloat(balanceToPay)) {
				return {
					status: 0,
					remarks: "Insuficient fund. Please reload to continue transaction.",
				};
			}

			const balanceAfter = parseFloat(user.ecashWallet) - parseFloat(balanceToPay);
			const balanceToRollback = balanceAfter + parseFloat(balanceToPay);
			// const balanceAfter = user.ecashWallet - (paymayalog.amount + (paymayalog.amount - unilevelData.charges));
			log(`**** WALLET BEFORE ${user.ecashWallet} ****`);
			log(`**** WALLET AFTER ${balanceAfter} ****`);

			await DataManager._models.User.update({ ecashWallet: balanceAfter }, { where: { regcode } });
			
			log({ "varify status code": paymayalog.status, verifyResponse: verifyResponse });
			if (paymayalog.status == "POSTED" || (paymayalog.status == "OTP" && verifyResponse.status == 1)) {
				// FOR REPROCESSING
				log({ "Status ": paymayalog.status });

				// FOR EXECUTE REMITTANCE

				const generalReport = await DataManager._models.GeneralReport.findOne({ where: { regcode }, order: [["transNo", "DESC"]] });
				const payload = {
					transNo: generalReport ? generalReport.transNo + 1 : 1,
					regcode,
					trackingNumber: paymayalog.trackingNumber,
					transType: 7,
					amount: paymayalog.amount,
					balanceBefore: user.ecashWallet,
					balanceAfter,
					date: moment().format("YYYY-MM-DD"),
					time: moment().format("HH:mm:ss"),
					ipAddress: paymayalog.ipAddress,
					income: unilevelData.income,
					companyIncome: unilevelData.company_income, 
					charge: paymayalog.charge,
				};
				await DataManager._models.GeneralReport.create(payload);
				await DataManager._models.SmartpaymayaLog.update({
					status: "PENDING",
					remarks: "Need To Execute Remittance", 
				}, where);
				// const payload = {
				// 	transNo: generalReport ? generalReport.transNo + 1 : 1,
				// 	regcode,
				// 	trackingNumber: paymayalog.trackingNumber,
				// 	transType: 7,
				// 	amount: paymayalog.amount,
				// 	balanceBefore: user.ecashWallet,
				// 	balanceAfter,
				// 	date: moment().format("YYYY-MM-DD"),
				// 	time: moment().format("HH:mm:ss"),
				// 	ipAddress: paymayalog.ipAddress,
				// 	income: unilevelData.income,
				// 	companyIncome: unilevelData.company_income, 
				// 	charge: paymayalog.charge,
				// };
				// const genRep = await DataManager._models.GeneralReport.create(payload);

				const executeRemittance = await TransactionService.unholdRemittance(paymayalog, 2);
				// const executeRemittance = "";
				log({ "ExecuteRemittance": JSON.stringify(executeRemittance) });
				// executeRemittance.responseCode = "12323";
				logsDetails["remarks"] = executeRemittance.description;
				await TransactionService.logsTransactions(logsDetails);
				log("TransactionService execute changes APPROVED");

				if (executeRemittance.responseCode != "0000"  && executeRemittance.responseCode != undefined ) {	
					// transaction.rollback();
					const remarks = "An Error occur. Transaction  rolled back.";
					// if (["1996", "2097", "2098", "2091", "500"].includes(executeRemittance.responseCode)) {
					//["RA1021", "RA1031", "RA1034", "RA1035", "RA1047", "RA1048", "2041", "2043", "2061", "2065"]
					// await DataManager._models.SmartpaymayaLog.update({
					// 	status: "FAILED",
					// 	remarks: executeRemittance.description,
					// 	amountBefore: user.ecashWallet,
					// 	amountAfter: user.ecashWallet,
					// }, where);
					await DataManager._models.SmartpaymayaLog.update({
						status: "FAILED",
						remarks: executeRemittance.description + " "+"AUTO ROLLED BACK",
						referenceNumber: "FAILED",
						balanceBefore: user.ecashWallet,
						balanceAfter: balanceToRollback,
					}, where);
					await DataManager._models.GeneralReport.update({ 
						balanceBefore: user.ecashWallet,
						balanceAfter: balanceToRollback,
					}, where);
					log(`Balance to rollback ${balanceToRollback}`); 
					await DataManager._models.User.update({ ecashWallet: balanceToRollback },
						{
							where: { regcode },
						});
					return {
						status: 0,
						remarks,
					}; 
				} else {
					const balanceWithUnilevel = balanceAfter - parseFloat(unilevelData.income);
					log("EXECUTING REMITTANCE");

					if ([1, 6].includes(user.userlevel)) {
						await TransactionService.addUnilevel(regcode, unilevelData.unilevel, paymayalog.trackingNumber, paymayalog.ipAddress, "REMIT");
					}
					if (executeRemittance.responseCode == undefined ) {
						await DataManager._models.SmartpaymayaLog.update({
							status: "ERROR",
							remarks: "ERROR:" + executeRemittance.description,
							balanceBefore: user.ecashWallet,
							balanceAfter: balanceWithUnilevel,
							referenceNumber: "ERROR TRANSACTION",
						},
						where);
					} else {
						await DataManager._models.SmartpaymayaLog.update({
							status: "APPROVED",
							remarks: executeRemittance.description,
							balanceBefore: user.ecashWallet,
							balanceAfter: balanceWithUnilevel,
							referenceNumber: executeRemittance.transactionReferenceNumber,
						},
						where);
					}
					await DataManager._models.User.update({ ecashWallet: balanceWithUnilevel }, { where: { regcode }});
					
					// try {
						
					// 	log("Begin Attempt - Creating General Report Object");
					
					// 	log("Creating Payload Object:");
					// 	log(payload);
					// 	log("Sending Payload...");
					
					// 	transaction.commit();
					// 	log("Payload Response:");
					// 	log({ genRep });
					// } catch (error) {
					// 	log("Attempt Failed - Err:");
					// 	log({ error });
					// }

					// UPDATE PAYMAYA AND DEDUCT REMITTANCE
					
					

					log({ balanceAfter, balanceToRollback });
					const ret  = {
						status: executeRemittance.status,
						remarks: executeRemittance.description,
					};
					if (executeRemittance.responseCode == undefined) {
						ret.status= 0;
						ret.remarks= "ERROR UNDEFINED RESPONSE";
					} else {
						const beneficiary = await DataManager._models.SmartpaymayaCustomerBeneficiary.findOne({ where: { beneficiaryId: paymayalog.beneficiary } });
						const sender = await DataManager._models.SmartpaymayaCustomerSender.findOne({ where: { customerId: paymayalog.sender } });
						log(beneficiary);
						log(sender);
						log(sender.mobileNumber);
						await TransactionService.sendEmail(user.emailAddress, paymayalog.trackingNumber);
						await TransactionService.sendSms("0"+sender.mobileNumber, parseFloat(paymayalog.amount), paymayalog.account, executeRemittance.transactionReferenceNumber);
						await TransactionService.sendSms("0"+beneficiary.mobileNo, parseFloat(paymayalog.amount), paymayalog.account, executeRemittance.transactionReferenceNumber);
	
					}
					//ecash_to_paymaya_send; 

					log({ "ret": ret });
					return ret;
				}
			} else if (verifyResponse.status != 1) {
				log({ "rollback": 1 });
				transaction.rollback();
				return {
					status: 0,
					remarks: verifyResponse.M,
				};
			} else if (paymayalog.status == "FAILED") {
				log({ "else": 1 });
				transaction.rollback();
				return {
					status: 0,
					remarks: paymayalog.remarks,
				};
			}
		} else if (args.where.process == "getDetails") {
			return await DataManager._models.SmartpaymayaLog.findOne(
				{
					where: { trackingNumber: args.where.trackingNumber },
					include: [
						{
							model: DataManager._models.SmartpaymayaCustomerSender,
							as: "senderDetails",
						},
						{
							model: DataManager._models.SmartpaymayaCustomerBeneficiary,
							as: "beneficiaryDetails",
						},
					],
				});
		} else if (args.where.process == "search") {
			const regcode = args.where.regcode;
			const ret = await DataManager._models.SmartpaymayaLog.findOne({ where: { trackingNumber: args.where.trackingNumber, regcode } });

			log({ ret: JSON.stringify(ret) });
			if (ret.trackingNumber) {
				return ret;
			}

			return {
				status: 0,
				remarks: "",
			};
		} else if (args.where.process == "getCharge") {
			return TransactionService.getCharge(6, args.where.amount);
		} else if (args.where.process == "email") {
			// const details = TransactionService.calculateIncom e(
			// 	args.where.amount, 
			// );
			const details = {};
			return {
				remarks: JSON.stringify(details),
			};

		} else {
			return {
				status: 0,
				remarks: "an error occur while verifying your OTP. Please try again.",
			};
		}
	}

	create = async (args) => {
		try {
			log("-== Create ==-", JSON.stringify(args));
			const transaction = await DataManager._manager.transaction();
			const { sender, beneficiary, senderId, regcode, accountNumber, channel, totalAmount, transactionPassword, ipAddress } = args;
			// const { sender, beneficiary, senderId, regcode, accountNumber, totalAmount, transactionPassword, ipAddress } = args;
			const requestReferenceNumber = await TransactionService.generateUUID();
			const user = await DataManager._models.User.findOne({ where: { regcode }, transaction });
			const status = await TransactionService.status(user.userlevel, totalAmount);
			const idDetails = await TransactionService.getIdDetails(senderId.id);
			const res = await TransactionService.getCharge(user.userlevel, parseFloat(totalAmount));
			// const rett = true;
			// if (rett) {
			// 	return [{ remark: res }];
			// }
			// log(user);
			log(JSON.stringify(args));
			log(res.charge == 0);
			if (res.charge == 0) {
				return {
					status: 0,
					remarks: "Insuficient balance",
				};
			}
			log({ "user": JSON.stringify(user) });
			if (!user) {
				return {
					status: 0,
					remarks: "User not found",
				};
			}

			if (user.transactionPassword !== CryptoJS.MD5(transactionPassword).toString()) {
				return {
					status: 0,
					remarks: "Wrong transaction password input. Please input correct transaction Password",
				};
			}

			if (status == "FRAUD") {
				return {
					status: 0,
					remarks: "Amount Limit Exceeded!",
				};
			}
			log("===================================check balance CREATE REMITTANCE: user balance" + user.ecashWallet + "   TOTAL AMOUNT TO PAY: "+ (parseFloat(res.charge) + parseFloat(totalAmount)));
			log("");
			if (user.ecashWallet < (parseFloat(res.charge) + parseFloat(totalAmount))) {
				log("Insuficient fund. Please reload to continue transaction.");
				return {
					status: 0,
					remarks: "Insuficient balance.",
				};
			}

			if (idDetails.status.toString().toUpperCase() !== "APPROVED") {
				return {
					status: 0,
					remarks: "Id not validate",
				};
			}

			if (moment().format("YYYY-MM-DD") > moment(idDetails.expiry).format("YYYY-MM-DD")) {
				return {
					status: 0,
					remarks: "ID is already expired",
				};
			}

			const trackingNumber = await TransactionService.generateTrackingNumber(user.userlevel, regcode);
			// const res = await TransactionService.getCharge(user.userlevel, parseFloat(totalAmount));

			let data = {
				regcode,
				requestReferenceNumber: requestReferenceNumber,
				trackingNumber: trackingNumber,
				"channel": channel,
				// "channel": "pymy",
				amount: totalAmount,
				sender,
				beneficiary,
				senderId: senderId.id,
				charge: res.charge,
				ip: ipAddress,
				"status": status,
				account: accountNumber,
			};

			log({ "data-saving payment log": JSON.stringify(data) });
			const saveLogs = await this._model.create(data, { transaction });

			log({ "saveLogs": JSON.stringify(saveLogs) });

			const where = { where: { trackingNumber: trackingNumber } };
			const requestRemittance = await TransactionService.unholdRemittance(saveLogs, 1);
			log({ "requestRemittance": requestRemittance });

			// ******************************
			if (requestRemittance.responseCode == undefined || requestRemittance.responseCode == "" || requestRemittance.responseCode != "0000") {
				transaction.rollback();
				let description = requestRemittance.description;
				if (requestRemittance.responseCode) {
					if (requestRemittance.meta && requestRemittance.meta.errors) {
						if (requestRemittance.meta.errors[0].property == "account") {
							description = "Account is invalid";
						}
					}
				}

				return {
					status: 0,
					remarks: description,
				};
			}

			transaction.commit();

			// UPDATE TRANSACTION'S STATUS AND SET 'referenceNumber'
			await DataManager._models.SmartpaymayaLog.update({
				status: requestRemittance.status,
				referenceNumber: requestRemittance.transactionReferenceNumber,
			}, where);	

			try {
				if (saveLogs.status == "OTP") {
					await DataManager._models.SmartpaymayaLog.update({
						status: "OTP",
					}, where);

					const param = {
						trackno: trackingNumber,
						regcode,
						receiver: "smartmoney #" + accountNumber,
						email: user.emailAddress,
						mobile: user.mobileNumber,
						amount: totalAmount,
						ip: ipAddress,
						t_code: 2,
						cgroup: user.companyGroup,
					};

					const otpStatus = await TransactionService.OTP("create_otp", param);
					log({ "parma": param, "otpStatus": otpStatus });

					if (otpStatus.status && otpStatus.status == 1) {

						const ret = {
							status: "OTP",
							trackingNumber: trackingNumber,
							remarks: otpStatus.M,
						};

						log(ret);
						return ret;
					} else {
						const ret = {
							status: saveLogs.status,
							referenceNumber: "",
							remarks: "Error occur on generating OTP.",
						};

						log({ ret });
						return ret;
					}

				} else {
					log("UNHOLD");
					let balanceToPay = 0;
					const unilevelData = await TransactionService.calculateIncome(totalAmount, user.userlevel);
					const logsDetails = {
						beneficiary: beneficiary,
						accountNumber: accountNumber,
						amount: totalAmount,
						ipAddress: ipAddress,
						transType: 1,
						status: 0,
					};

					if ([1, 6].includes(user.userlevel)) {
						balanceToPay = parseFloat(totalAmount) + parseFloat(res.charge);
					} else {
						balanceToPay = parseFloat(totalAmount) + parseFloat(res.charge);
					}

					const balanceAfter = parseFloat(user.ecashWallet) - parseFloat(balanceToPay);
					const balanceToRollback = balanceAfter + parseFloat(balanceToPay);
				 
					log(`**** WALLET BEFORE ${user.ecashWallet} ****`, `**** WALLET AFTER ${balanceAfter} ****`);
					log(`Balance to deduct ${balanceAfter}`);
					await DataManager._models.User.update({ ecashWallet: balanceAfter },
						{
							where: { regcode },
						});

					data["referenceNumber"] = requestRemittance.transactionReferenceNumber;

					const generalReport = await DataManager._models.GeneralReport.findOne({ where: { regcode }, order: [["transNo", "DESC"]] });
					log({ generalReport: JSON.stringify(generalReport) });

					await DataManager._models.GeneralReport.create({
						transNo: generalReport ? generalReport.transNo + 1 : 1,
						regcode,
						trackingNumber: trackingNumber,
						transType: 7,
						amount: totalAmount,
						balanceBefore: user.ecashWallet,
						balanceAfter,
						date: moment().format("YYYY-MM-DD"),
						time: moment().format("HH:mm:ss"),
						ipAddress: ipAddress,
						charge: data.charge,
						income: unilevelData.income,
						companyIncome: unilevelData.company_income,
						status: "PENDING",
						remarks: "Need To Execute Remittance",
					});
					await DataManager._models.SmartpaymayaLog.update({
						status: "PENDING",
						remarks: "Need To Execute Remittance", 
					}, where);
					// await DataManager._models.GeneralReport.create({
					// 	transNo: generalReport ? generalReport.transNo + 1 : 1,
					// 	regcode,
					// 	trackingNumber: trackingNumber,
					// 	transType: 7,
					// 	amount: totalAmount,
					// 	balanceBefore: user.ecashWallet,
					// 	balanceAfter,
					// 	date: moment().format("YYYY-MM-DD"),
					// 	time: moment().format("HH:mm:ss"),
					// 	ipAddress: ipAddress,
					// 	charge: data.charge,
					// 	income: unilevelData.income,
					// 	companyIncome: unilevelData.company_income,
					// 	status: executeRemittance.status,
					// 	remarks: executeRemittance.description,
					// });
					log("FOR EXECUTE REMITTANCE");
					const executeRemittance = await TransactionService.unholdRemittance(data, 2);
					// const executeRemittance = "";
					logsDetails["remarks"] = executeRemittance.description;
					await TransactionService.logsTransactions(logsDetails);
					// executeRemittance.responseCode = "123456789";
					if (executeRemittance.responseCode != "0000" && executeRemittance.responseCode != undefined ) {
						// transaction.rollback();
						await DataManager._models.SmartpaymayaLog.update({
							status: "FAILED",
							remarks: "AUTO ROLLED BACK",
							referenceNumber: "FAILED",
							balanceBefore: user.ecashWallet,
							balanceAfter: balanceToRollback,
						}, where);
						await DataManager._models.GeneralReport.update({
							balanceAfter: balanceToRollback,
						}, {
							where: { trackingNumber },
						});
						log(`Balance to rollback ${balanceToRollback}`); 
						await DataManager._models.User.update({ ecashWallet: balanceToRollback },
							{
								where: { regcode },
							});
						/*
							if (["1996", "2097", "2098", "2091", "500"].includes(executeRemittance.responseCode)) {
								return {
									status: "REMITAGAIN",
									remarks: "System encounter minor problem. Please try again.",
								};
							} else {
						*/

						let remarks = "An Error occur. Transaction  rolled back.";
						if (["RA1021", "RA1031", "RA1034", "RA1035", "RA1047", "RA1048", "2041", "2043", "2061", "2065"].includes(executeRemittance.responseCode)) {
							remarks = executeRemittance.description;
						}

						 
						const ret =  {
							status: 5,
							remarks,
							trackingNumber: trackingNumber,
						};
						 
						return ret;
						// log({ erroRet: ret });
						// return ret;
						// }
					} else {
						// if ([1, 6].includes(user.userlevel)) {
						// 	balanceToPay = parseFloat(totalAmount) + parseFloat(res.charge) ;
						// } else {
						// 	balanceToPay = parseFloat(totalAmount) + parseFloat(res.charge);
						// }
						let total = parseFloat(totalAmount) + parseFloat(res.charge) - parseFloat(unilevelData.income);
						log("Unilevel income: "+ parseFloat(unilevelData.income));
						log("Balance with Unilevel: "+total);
						log("Balance ecash wallet: "+ parseFloat(user.ecashWallet) );
						const balanceWithUnilevel = parseFloat(user.ecashWallet) - parseFloat(total); 
						if ([1, 6].includes(user.userlevel)) {
							await TransactionService.addUnilevel(regcode, unilevelData.unilevel, trackingNumber, ipAddress, "REMIT");
						}
						if (executeRemittance.responseCode == undefined ) {
							await DataManager._models.SmartpaymayaLog.update({
								status: "ERROR",
								remarks: "ERROR: UNDEFINED" + executeRemittance.description,
								balanceBefore: user.ecashWallet,
								balanceAfter: balanceWithUnilevel,
								referenceNumber: "ERROR",
							},
							where);
						} else {
							await DataManager._models.SmartpaymayaLog.update({
								status: "APPROVED",
								remarks: executeRemittance.description,
								balanceBefore: user.ecashWallet,
								balanceAfter: balanceWithUnilevel,
								referenceNumber: executeRemittance.transactionReferenceNumber,
							},
							where);
						}
						await DataManager._models.GeneralReport.update({
							balanceAfter: balanceWithUnilevel,
						}, {
							where: { trackingNumber },
						});
						await DataManager._models.User.update({ ecashWallet: balanceWithUnilevel },
							{
								where: { regcode },
							});
						const paymayalog = await DataManager._models.SmartpaymayaLog.findOne({ where: { trackingNumber: trackingNumber } });
						// UPDATE PAYMAYA AND DEDUCT REMITTANCE
						if  (executeRemittance.responseCode != undefined) {
							const beneficiary = await DataManager._models.SmartpaymayaCustomerBeneficiary.findOne({ where: { beneficiaryId: paymayalog.beneficiary } });
							const sender = await DataManager._models.SmartpaymayaCustomerSender.findOne({ where: { customerId: paymayalog.sender } });
							log(beneficiary);
							log(sender);
							log(sender.mobileNumber); 
							
							await TransactionService.sendSms("0"+sender.mobileNumber, parseFloat(totalAmount), accountNumber, executeRemittance.transactionReferenceNumber);
							await TransactionService.sendEmail(user.emailAddress, trackingNumber);
							await TransactionService.sendSms("0"+beneficiary.mobileNo, parseFloat(totalAmount), accountNumber, executeRemittance.transactionReferenceNumber);
						}
						
						// UPDATE PAYMAYA AND DEDUCT REMITTANCE
						const response =  {
							status: executeRemittance.status,
							remarks: executeRemittance.description,
							trackingNumber: trackingNumber,
						};
						if (executeRemittance.responseCode == undefined ) {
							response.status = 5;
							response.remarks = "Undefined Error";
						} 
						return response;
					}
					// 

				}
			} catch (error) {
				log({ 0: "ERROR ON TRY", 1: error });
			}
		} catch (error) {
			log({ 0: "Fault", 1: error });
			return { S: 0, M: "Error on creating" };
		}
	}
}

export default SmartpaymayaLog;