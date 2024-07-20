const express = require("express");
const router = express.Router();
const Active = require("../models/Active");
const { Op } = require("sequelize");

router.post("/add", (req, res) => {
	Active.findAll({
		where: {
			softwareId: req.body.softwareId,
			trace: { [Op.gt]: Date.now() - 20 * 24 * 60 * 60 * 1000 },
		},
	})
		.then((actives) => {
			if (actives.length > 0) {
				res.json({
					status: 403,
					message: "Spamming",
				});
			} else {
				//create a active
				Active.create({
					softwareId: req.body.softwareId,
					transaction: req.body.transaction,
					userEmail: req.body.country,
					live: 1,
					linker: Date.now(),
					trace: Date.now(),
					deleted: 0,
					status: 0,
				})
					.then((active) => {
						res.json({ active, status: 201 });
					})
					.catch((err) =>
						res.json({
							status: 500,
							message: "Active couldn't be created",
						})
					);
			}
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Unknown error",
			})
		);
});

//get actives
router.post("/get", (req, res) => {
	Active.findAll({
		where: {
			softwareId: req.body.softwareId,
			trace: { [Op.gt]: Date.now() - 30 * 24 * 60 * 60 * 1000 },
		},
	})
		.then((actives) => {
			res.json({ actives, status: 200 });
		})
		.catch((err) => {
			res.json({
				status: 500,
				message: "Unknown error",
			});
		});
});

module.exports = router;
