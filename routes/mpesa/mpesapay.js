const express = require("express");
const router = express.Router();
const fetch = require("isomorphic-fetch");
const verifyToken = require("../../middleware/verifyToken");

// Function to generate access token
const GenerateAccessToken = () => {
	const consumerKey = process.env.MPESA_KEY; // REPLACE IT WITH YOUR CONSUMER KEY
	const consumerSecret = process.env.MPESA_SECRET; // REPLACE IT WITH YOUR CONSUMER SECRET
	const auth =
		"Basic " +
		Buffer.from(consumerKey + ":" + consumerSecret).toString("base64");
	const accessTokenUrl =
		"https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

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
				reject(error);
			});
	});
};

// Function to initiate an STK push
const InitiateSTKPush = (accessToken, req, res) => {
	const mpesaApiUrl =
		"https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
	const timestamp = new Date()
		.toISOString()
		.replace(/[^0-9]/g, "")
		.slice(0, -3);
	const password = Buffer.from(
		"174379" + process.env.MPESA_PASS /*Your PassKey*/ + timestamp
	).toString("base64");

	const payload = {
		BusinessShortCode: "174379",
		Password: password,
		Timestamp: timestamp,
		TransactionType: "CustomerPayBillOnline",
		Amount: req.body.amount,
		PartyA: req.body.phone,
		PartyB: "174379",
		PhoneNumber: req.body.phone,
		CallBackURL: `https://cb80-41-81-2-162.ngrok-free.app/${req.body.houseNo}/174379/${req.body.instLinker}/${req.body.invoiceLinker}`,
		AccountReference: req.body.houseNo,
		TransactionDesc: req.body.details,
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
				console.log(response);
				if (!response.ok) {
					return response.json();
					throw new Error(response);
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

// Function to handle expected responses
const HandleResponse = (response) => {
	console.log("Response:", response);
	// Handle response accordingly
};

//initiate stk push
router.post("/pay", verifyToken, (req, res) => {
	GenerateAccessToken()
		.then((accessToken) => {
			console.log("Access token:", accessToken);
			InitiateSTKPush(accessToken, req, res);
		})
		.then((stkPushResponse) => {
			console.log("STK push response:", stkPushResponse);
			// Handle STK push response
			HandleResponse(stkPushResponse);
			res.json({ status: 200, message: "Transaction initiated successfully" });
		})
		.catch((error) => {
			console.error("Error:", error);
			res.json({ status: 500, message: "Internal server error" });
		});
});

module.exports = router;
