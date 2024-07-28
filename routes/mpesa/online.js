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
	cycle
) => {
	console.log(cycle);
	const mpesaApiUrl =
		cycle === 1
			? "https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl"
			: "https://api.safaricom.co.ke/mpesa/c2b/v2/registerurl";
	const payload = {
		ShortCode: `${identity}`, //business Shortcode,
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
			res.json({ online, status: 200 });
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
		.catch((err) => {
			console.log(err);
			res.json({
				status: 500,
				message: "Online couldn't be edited",
			});
		});
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

// Function to handle expected responses
const HandleResponse = (response) => {
	console.log("Response:", response);
	// Handle response accordingly
};

//mpesa registration
router.post("/register/:type", verifyToken, verifyAdmin, (req, res) => {
	InitiateRegister(req, res, 1);
});

const InitiateRegister = (req, res, cycle) => {
	// GetAccessToken(STKPush, req, res);
	GenerateAccessToken(req, res)
		.then(async (accessToken) => {
			return await RegisterURLs(
				accessToken,
				req.body.identity,
				`https://financeapi.techsystem.world/verify-pay/validate/${req.body.instLinker}`,
				`https://financeapi.techsystem.world/verify-pay/confirm/${req.body.instLinker}`,
				cycle
			);
		})
		.then((response) => {
			// Handle register url response
			HandleResponse(response);

			if (response.ResponseCode !== "0") {
				if (cycle === 1) {
					InitiateRegister(req, res, 2);
				} else {
					throw new Error("Failed to register urls");
				}
			} else if (req.body.type === "live-add") {
				AddOnline(req, res);
			} else if (req.body.type === "live-edit") {
				EditOnline(req, res);
			} else {
				res.json({ status: 200 });
			}
		})
		.catch((error) => {
			res.json({ status: 500 });
			console.error("Error:", error);
		});
};

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
	// Send a success response if the transaction is valid
	const successResponse = {
		ResultCode: 0,
		ResultDesc: "Accepted",
	};
	res.json(successResponse);
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

//mpesa validation
router.post("/validate/:instLinker", (req, res) => {
	// Send a success response if the transaction is valid
	const successResponse = {
		ResultCode: 0,
		ResultDesc: "Accepted",
	};
	res.json(successResponse);
});

//mpesa confirmation
router.post("/confirm/:instLinker", (req, res) => {
	const successResponse = {
		ResultCode: 0,
		ResultDesc: "Accepted",
	};
	res.json(successResponse);
});

module.exports = router;
