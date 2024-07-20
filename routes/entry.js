const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyStaff = require("../middleware/verifyStaff");
const router = express.Router();
const Entry = require("../models/Entry");
const { Op } = require("sequelize");
const OnlinePayment = require("../models/OnlinePayment");

router.post("/add", verifyToken, verifyStaff, (req, res) => {
	//create a entry
	Entry.create({
		amount: req.body.amount,
		details: req.body.details,
		security: req.body.security,
		guarantors: req.body.guarantors,
		principal: req.body.principal,
		period: req.body.period,
		type: req.body.type,
		code: req.body.code,
		accountLinker: req.body.accountLinker,
		clientLinker: req.body.clientLinker,
		branchLinker: req.branchLinker,
		modeLinker: req.body.modeLinker,
		credLinker: req.credLinker,
		instLinker: req.body.instLinker,
		live: 1,
		linker: req.body.linker,
		trace: req.body.trace,
		deleted: req.body.deleted || 0,
		status: 0,
	})
		.then((entry) => {
			req.io
				.to(req.body.instLinker)
				.emit("message", { ...entry, messageType: "entry" });
			res.json({ entry, status: 201 });
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Entry couldn't be created",
			})
		);
});

//edit entry
router.post("/edit", verifyToken, verifyStaff, (req, res) => {
	Entry.findOne({
		where: { id: req.body.id, instLinker: req.body.instLinker },
	})
		.then((entry) => {
			if (entry) {
				entry.amount = req.body.amount ? req.body.amount : entry.amount;
				entry.details = req.body.details ? req.body.details : entry.details;
				entry.security = req.body.security ? req.body.security : entry.security;
				entry.code = req.body.code ? req.body.code : entry.code;
				entry.guarantors = req.body.guarantors
					? req.body.guarantors
					: entry.guarantors;
				entry.principal = req.body.principal
					? req.body.principal
					: entry.principal;
				entry.period = req.body.period ? req.body.period : entry.period;
				entry.type = req.body.type ? req.body.type : entry.type;
				entry.accountLinker = req.body.accountLinker
					? req.body.accountLinker
					: entry.accountLinker;
				entry.clientLinker = req.body.clientLinker
					? req.body.clientLinker
					: entry.clientLinker;
				entry.branchLinker = req.branchLinker;
				entry.modeLinker = req.body.modeLinker
					? req.body.modeLinker
					: entry.modeLinker;
				entry.credLinker = req.credLinker;
				entry.trace = req.body.trace ? req.body.trace : entry.trace;
				entry.live = 1;
				entry.deleted = req.body.deleted ? req.body.deleted : entry.deleted;
				entry.save();
				req.io
					.to(req.body.instLinker)
					.emit("message", { ...entry, messageType: "entry" });
				res.json({ entry, status: 200 });
			} else {
				res.json({ status: 404, message: "Entry not found" });
			}
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Entry couldn't be edited",
			})
		);
});

//get entrys
router.post("/get", verifyToken, (req, res) => {
	Entry.findAll({
		where: {
			instLinker: req.body.instLinker,
			trace: { [Op.gt]: req.body.online },
		},
	})
		.then((entrys) => {
			res.json({ entrys, status: 200 });
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Unknown error",
			})
		);
});

//get mpesa online payments
router.post("/mpesa", verifyToken, verifyStaff, (req, res) => {
	OnlinePayment.findAll({
		where: {
			instLinker: req.body.instLinker,
			trace: { [Op.gt]: req.body.online },
		},
	})
		.then((mpesaPayments) => {
			res.json({ mpesaPayments, status: 200 });
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Unknown error",
			})
		);
});

module.exports = router;
