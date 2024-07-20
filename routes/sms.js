const express = require("express");
const router = express.Router();
const Sms = require("../models/Sms");
const { Op } = require("sequelize");
const fetch = require("isomorphic-fetch");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

const TransactSms = (instLinker, amount, trace, sms, req, res) => {
	Sms.create({
		bf: sms ? sms.dataValues.cf : 0,
		amount: amount,
		cf: sms ? parseInt(sms.dataValues.cf) + parseInt(amount) : amount,
		instLinker: instLinker,
		live: 1,
		linker: trace,
		trace: trace,
		deleted: 0,
		status: 0,
	})
		.then((newsms) => {
			req.io.to(instLinker).emit("message", { ...newsms, messageType: "sms" });
			if (res !== "live") {
				res.json({ newsms, status: 200 });
			}
		})
		.catch((err) => {
			if (res !== "live") {
				res.json({
					status: 500,
					message: "sms error",
				});
			}
		});
};

const SendSms = (message) => {
	return new Promise((resolve, reject) => {
		fetch(`https://sms.textsms.co.ke/api/services/sendbulk/`, {
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(message),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(response);
				} else {
				}

				return response.json();
			})
			.then((data) => {
				resolve(data);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

const GenerateAccessToken = () => {
	const consumer_key = process.env.MPESA_KEY; // REPLACE IT WITH YOUR CONSUMER KEY
	const consumer_secret = process.env.MPESA_SECRET; // REPLACE IT WITH YOUR CONSUMER SECRET

	const auth =
		"Basic " +
		Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");
	const accessTokenUrl = `${process.env.MPESA_URL}/oauth/v1/generate?grant_type=client_credentials`;

	return new Promise((resolve, reject) => {
		fetch(accessTokenUrl, {
			method: "GET",
			headers: {
				Authorization: auth,
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to fetch access token");
				}

				return response.json();
			})
			.then((data) => {
				resolve(data.access_token);
			})
			.catch((error) => {
				console.log(error);
				reject(error);
			});
	});
};

// Function to initiate an STK push
const InitiateSTKPush = (
	accessToken,
	amount,
	phoneNumber,
	CallBackURL,
	softwareId,
	res
) => {
	const mpesaApiUrl = `${process.env.MPESA_URL}/mpesa/stkpush/v1/processrequest`;
	const timestamp = new Date()
		.toISOString()
		.replace(/[^0-9]/g, "")
		.slice(0, -3);
	const password = Buffer.from(
		process.env.MPESA_SHORTCODE +
			process.env.MPESA_PASS /*Your PassKey*/ +
			timestamp
	).toString("base64");

	const payload = {
		BusinessShortCode: process.env.MPESA_SHORTCODE,
		Password: password,
		Timestamp: timestamp,
		TransactionType: "CustomerPayBillOnline",
		Amount: amount,
		PartyA: phoneNumber,
		PartyB: process.env.MPESA_SHORTCODE,
		PhoneNumber: phoneNumber,
		CallBackURL: CallBackURL,
		AccountReference: `${softwareId}-sms`,
		TransactionDesc: "Rental Techsystem SMS",
	};

	return new Promise((resolve, reject) => {
		fetch(mpesaApiUrl, {
			method: "POST",
			headers: {
				Authorization: "Bearer " + accessToken,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(response);
				} else {
					res.json({
						status: 200,
						message: "Transaction Initiated",
					});
				}

				return response.json();
			})
			.then((data) => {
				resolve(data);
			})
			.catch((error) => {
				res.json({
					status: 500,
					message: "Transaction failed to initiate",
				});

				reject(error);
			});
	});
};

// Function to handle expected responses
const HandleResponse = (response) => {
	console.log("Response:", response);
	// Handle response accordingly
};

router.post("/purchase", (req, res) => {
	GenerateAccessToken()
		.then((accessToken) => {
			//  console.log('Register URLs response:',  RegisterURLsResponse);
			return InitiateSTKPush(
				accessToken,
				`${req.body.amount}`,
				`${req.body.number}`,
				`https://6a10-196-96-76-50.ngrok-free.app/sms/purchase-verify/${req.body.instLinker}`,
				`${parseInt(req.body.instLinker / 1000)}`.split("").reverse().join(""),
				res
			);
		})
		.then((stkPushResponse) => {
			console.log("STK push response:", stkPushResponse);
			// Handle STK push response
			HandleResponse(stkPushResponse);
		})
		.catch((error) => {
			HandleResponse(error);
			console.error("Error:", error);
		});
});

router.post("/purchase-verify/:instlinker", (req, res) => {
	const callbackMetadata = req.body.Body.stkCallback.CallbackMetadata;
	const amount = callbackMetadata.Item[0].Value;
	// Send a success response if the transaction is valid
	const successResponse = {
		ResultCode: 0,
		ResultDesc: "Accepted",
	};
	res.json(successResponse); //select last sms transaction
	Sms.findOne({
		where: {
			instLinker: req.params.instlinker,
		},
		order: [["id", "DESC"]],
	})
		.then((sms) => {
			TransactSms(
				req.params.instlinker,
				amount * 2,
				Date.now(),
				sms,
				req,
				"live"
			);
		})
		.catch((err) => console.log(err));
});

router.post("/send", verifyToken, verifyAdmin, (req, res) => {
	//select last sms transaction
	Sms.findOne({
		where: {
			instLinker: req.body.instLinker,
		},
		order: [["id", "DESC"]],
	})
		.then((sms) => {
			if (!sms) {
				res.json({
					status: 501,
					message: "No sms bundle",
				});
				return;
			}
			if (sms.dataValues.cf < req.body.messages.length) {
				res.json({
					status: 501,
					message: "No enough sms bundle",
				});
				return;
			}

			let messages = req.body.messages.map((message, index) => ({
				...message,
				apikey: process.env.SMS_KEY,
				partnerID: process.env.SMS_ID,
				shortcode: process.env.SMS_SHORTCODE,
				pass_type: "plain",
				clientsmsid: 100 + index,
			}));

			// send sms
			SendSms({ count: messages.length, smslist: messages })
				.then((response) => {
					//transact new sms
					TransactSms(
						req.body.instLinker,
						-parseInt(req.body.messages.length),
						Date.now(),
						sms,
						req,
						res
					);
				})
				.catch((err) => {});
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "sms error",
			})
		);
});

router.post("/get", (req, res) => {
	Sms.findAll({
		where: { instLinker: req.body.instLinker },
	})
		.then((data) => res.json({ data, status: 200 }))
		.catch((err) => res.json({ status: 500, message: "Unknown error" }));
});

module.exports = router;
