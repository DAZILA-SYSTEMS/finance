const express = require("express");
const verifyToken = require("../../middleware/verifyToken");
const router = express.Router();
const Online = require("../../models/Online");
const verifyAdmin = require("../../middleware/verifyAdmin");
const { Op } = require("sequelize");
const fetch = require("isomorphic-fetch");
const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.DATA_KEY, "hex");
const iv = Buffer.from(process.env.DATA_IV, "hex");

const EncryptData = (value) => {
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(value, "utf8", "hex");
	encrypted += cipher.final("hex");
	return encrypted;
};

const DecryptData = (value) => {
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	let decrypted = decipher.update(value, "hex", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
};

// Function to register confirmation and validation URLs
const RegisterURLs = (
	accessToken,
	identity,
	ValidationURL,
	ConfirmationURL,
	type
) => {
	const mpesaApiUrl =
		type === "sandbox-test"
			? "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
			: "https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl";
	const payload = {
		ShortCode: identity, //business Shortcode,
		ResponseType: "Completed",
		ConfirmationURL,
		ValidationURL,
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
					throw new Error("Failed to register URLs");
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

const AddOnline = (req, res) => {
	//create a online
	Online.create({
		/*	key1: EncryptData(req.body.key1),
		key2: EncryptData(req.body.key2),
		key3: EncryptData(req.body.key3),
		type: req.body.type,
		identity: EncryptData(req.body.identity),*/
		credLinker: req.credLinker,
		instLinker: req.body.instLinker,
		live: 1,
		linker: req.body.linker,
		trace: req.body.trace,
		deleted: req.body.deleted || 0,
		status: 0,
	})
		.then((online) => {
			req.io
				.to(req.body.instLinker)
				.emit("message", { ...online, messageType: "online" });
			res.json({ online, status: 201 });
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Online couldn't be created",
			})
		);
};

const EditOnline = (req, res) => {
	Online.findOne({
		where: { id: req.body.id, instLinker: req.body.instLinker },
	})
		.then((online) => {
			if (online) {
				/*online.key1 = req.body.key1 ? EncryptData(req.body.key1) : online.key1;
				online.key3 = req.body.key3 ? EncryptData(req.body.key3) : online.key3;
				online.key2 = req.body.key2 ? EncryptData(req.body.key2) : online.key2;
				online.type = req.body.type ? req.body.type : online.type;
				online.identity = req.body.identity
					? EncryptData(req.body.identity)
					: online.identity;*/
				online.credLinker = req.credLinker;
				online.trace = req.body.trace ? req.body.trace : online.trace;
				online.live = 1;
				online.deleted = req.body.deleted ? req.body.deleted : online.deleted;
				online.save();

				res.json({ online, status: 200 });
			} else {
				res.json({ status: 404, message: "Online not found" });
			}
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Online couldn't be edited",
			})
		);
};

// Function to generate access token
const GenerateAccessToken = (req, res) => {
	const consumerKey = req.body.key1; //'YOUR_CONSUMER_KEY';
	const consumerSecret = req.body.key2; //'YOUR_CONSUMER_SECRET';
	const auth =
		"Basic " +
		Buffer.from(consumerKey + ":" + consumerSecret).toString("base64");
	const accessTokenUrl =
		req.params.type === "sandbox-test"
			? "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
			: "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

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
				res.json({
					status: 500,
					message: "Transaction failed to initiate",
				});
				reject(error);
			});
	});
};

const InitiateSTKPush = (
	accessToken,
	amount,
	phoneNumber,
	CallBackURL,
	passKey,
	ShortCode,
	type,
	req,
	res
) => {
	const mpesaApiUrl =
		type === "sandbox-test"
			? "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
			: "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
	let STKShortcode = type === "sandbox-test" ? "174379" : `${ShortCode}`;
	const timestamp = new Date()
		.toISOString()
		.replace(/[^0-9]/g, "")
		.slice(0, -3);
	const password = Buffer.from(STKShortcode + passKey + timestamp).toString(
		"base64"
	);

	const payload = {
		BusinessShortCode: STKShortcode,
		Password: password,
		Timestamp: timestamp,
		TransactionType: "CustomerPayBillOnline",
		Amount: `${amount}`,
		PartyA: phoneNumber,
		PartyB: STKShortcode,
		PhoneNumber: phoneNumber,
		CallBackURL: CallBackURL,
		AccountReference: `${type}`,
		TransactionDesc: "Test Payment",
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
					throw new Error("Failed to initiate STK push");
				} else if (type === "live-add") {
					AddOnline(req, res);
				} else if (type === "live-edit") {
					EditOnline(req, res);
				}
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

//mpesa registration
router.post("/register/:type", verifyToken, verifyAdmin, (req, res) => {
	// GetAccessToken(STKPush, req, res);
	GenerateAccessToken(req, res)
		.then((accessToken) => {
			return InitiateSTKPush(
				accessToken,
				req.body.amount,
				req.body.phone,
				`https://me.com/online-pay/verify-push/${req.userId}`,
				req.body.key3,
				req.body.identity,
				req.params.type,
				req,
				res
			);
		})
		.then((stkPushResponse) => {
			// Handle STK push response
			HandleResponse(stkPushResponse);

			return RegisterURLs(
				accessToken,
				req.body.identity,
				`https://me.com/online-pay/validate/${req.body.instLinker}`,
				`https://me.com/online-pay/confirm/${req.body.instLinker}`,
				req.params.type
			);
		})
		.then((RegisterURLsResponse) => {
			console.log("Register URLs response:", RegisterURLsResponse);
			// Handle register url response
			HandleResponse(RegisterURLsResponse);
		})
		.catch((error) => {
			console.error("Error:", error);
		});
});

//mpesa verify
router.post("/verify-push/:userId", (req, res) => {
	const merchantRequestID = req.body.Body.stkCallback.MerchantRequestID;
	const checkoutRequestID = req.body.Body.stkCallback.CheckoutRequestID;
	const resultCode = req.body.Body.stkCallback.ResultCode;
	const resultDesc = req.body.Body.stkCallback.ResultDesc;
	const callbackMetadata = req.body.Body.stkCallback.CallbackMetadata;
	const amount = callbackMetadata.Item[0].Value;
	const mpesaReceiptNumber = callbackMetadata.Item[1].Value;
	const transactionDate = callbackMetadata.Item[2].Value;
	const phoneNumber = callbackMetadata.Item[3].Value;
	req.io
		.to(req.params.userId)
		.emit("message", { data: req.body.Body, messageType: "sub" });
});

//get onlines
router.post("/get", verifyToken, (req, res) => {
	Online.findAll({
		where: {
			instLinker: req.body.instLinker,
		},
		attributes: ["type", "id", "linker", "instLinker"],
	})
		.then((onlinePays) => {
			res.json({ onlinePays, status: 200 });
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Unknown error",
			})
		);
});

module.exports = router;
