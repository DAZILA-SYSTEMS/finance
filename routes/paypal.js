//const fetch = require("isomorphic-fetch");
const express = require("express");
const Sub = require("../models/Sub");
const router = express.Router();

const GenerateCode = (req, res) => {
  Sub.count({
    where: {
      softwareId: req.body.softwareId,
    },
  })
    .then((count) => {
      Sub.create({
        softwareId: req.body.softwareId,
        code:
          (parseInt(req.body.softwareId) + parseInt(req.body.amount)) *
          (count + 2),
        credLinker: req.credLinker,
        instLinker: req.body.instLinker,
        live: 1,
        linker: req.body.linker,
        trace: req.body.trace,
        deleted: req.body.deleted || 0,
        status: 0,
      })
        .then((sub) => {
          req.io
            .to(req.body.softwareId)
            .emit("message", { ...sub, messageType: "sub" });
          res.json({ sub, status: 201 });
        })
        .catch((err) => {
          res.json({
            status: 500,
            message: "Sub couldn't be created",
          });
        });
    })
    .catch((err) => {
      res.json({
        status: 500,
        message: "Sub couldn't be created",
      });
    });
};

const base = process.env.PAYPAL_CLIENT_url;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
    ).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (cart) => {
  // use the cart information passed from the front-end to calculate the purchase unit details
  console.log(
    "shopping cart information passed from the frontend createOrder() callback:",
    cart
  );

  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders`;
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: "100.00",
        },
      },
    ],
  };

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
      // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (req, res, orderID) => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderID}/capture`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
      // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
  });

  return handleResponse(req, res, response);
};

async function handleResponse(req, res, response) {
  try {
    const jsonResponse = await response.json();
    console.log(jsonResponse.name);
    if (jsonResponse.name == "RESOURCE_NOT_FOUND") {
      return {
        jsonResponse,
        httpStatusCode: response.status,
      };
    } else {
      console.log("sam");
      GenerateCode(req, res);
    }
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

router.post("/orders/capture", async (req, res) => {
  return GenerateCode(req, res);
  try {
    const { orderID } = req.body;
    captureOrder(req, res, orderID);
    const { jsonResponse, httpStatusCode } = await captureOrder(
      req,
      res,
      orderID
    );
    // res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
});

module.exports = router;
