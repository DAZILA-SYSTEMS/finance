const express = require("express");
const router = express.Router();
const fetch = require("isomorphic-fetch");

const GenerateAccessToken = () => {
	const consumer_key = process.env.MPESA_KEY; // REPLACE IT WITH YOUR CONSUMER KEY
	const consumer_secret = process.env.MPESA_SECRET; // REPLACE IT WITH
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
		AccountReference: `${softwareId}`,
		TransactionDesc: "Finance Techsystem",
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

//subscription mpesa payment
router.post("/online/:type/:softwareId", (req, res) => {
	GenerateAccessToken()
		.then((accessToken) => {
			//  console.log('Register URLs response:',  RegisterURLsResponse);
			return InitiateSTKPush(
				accessToken,
				`${req.body.amount}`,
				"254703535116",
				`https://6a10-196-96-76-50.ngrok-free.app/pro/verify-online/${req.params.type}/${req.params.softwareId}`,
				req.params.softwareId,
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

// Function to handle expected responses
const HandleResponse = (response) => {
	console.log("Response:", response);
	// Handle response accordingly
};

module.exports = router;
