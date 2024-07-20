const express = require("express");
const router = express.Router();
const Sub = require("../models/Sub");
const { Op } = require("sequelize");
const fetch = require("isomorphic-fetch");

const FetchExchanges = () => {
	return new Promise((resolve, reject) => {
		fetch(
			`https://openexchangerates.org/api/latest.json?app_id=${process.env.EXCHANGE_ID}`,
			{
				headers: {
					"Content-Type": "application/json",
				},
				method: "GET",
			}
		)
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

router.post("/add", (req, res) => {
	//create a sub
	Sub.create({
		softwareId: req.body.softwareId,
		code: req.body.code,
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
		.catch((err) =>
			res.json({
				status: 500,
				message: "Sub couldn't be created",
			})
		);
});

//get subs
router.post("/get", (req, res) => {
	Sub.findAll({
		where: {
			softwareId: parseInt(
				parseInt(
					parseInt(
						parseInt(`${req.body.instLinker}`.split("").reverse().join("")) /
							1000
					)
				)
			),
		},
	})
		.then((subs) => {
			res.json({ subs, status: 200 });
		})
		.catch((err) => {
			res.json({
				status: 500,
				message: "Unknown error",
			});
		});
});

//fetch subs using software id
router.post("/fetch", (req, res) => {
	Sub.findAll({
		where: {
			softwareId: `${parseInt(req.body.softwareId)}`
				.split("")
				.reverse()
				.join(""),
		},
	})
		.then((subs) => {
			res.json({ subs, status: 200 });
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Unknown error",
			})
		);
});

//fetch current exchange rates
router.post("/exchange", (req, res) => {
	FetchExchanges()
		.then((data) => {
			if (data.rates) {
				return res.json({
					status: 200,
					data: data.rates,
				});
			} else {
				res.json({
					status: 500,
					message: "Unknown error",
				});
			}
		})
		.catch((error) => {
			res.json({
				status: 500,
				message: "Unknown error",
			});
		});
});

module.exports = router;
