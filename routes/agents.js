const express = require("express");
const router = express.Router();
const Agent = require("../models/Agent");

router.post("/add", (req, res) => {
	// check if the inst is already added by an agent
	Agent.findOne({
		where: {
			softwareId: req.body.softwareId,
		},
	})
		.then((agent) => {
			if (agent) {
				res.json({ status: 404, message: "Agent not found" });
			} else {
				//create an agent
				Agent.create({
					agentId: req.body.agentId,
					instName: req.body.instName,
					softwareId: req.body.softwareId,
					cost: req.body.cost,
					contact: req.body.contact,
					email: req.body.email,
					linker: Date.now(),
					deleted: req.body.deleted || 0,
					status: 0,
				})
					.then((data) => {
						res.json({ data, status: 201 });
					})
					.catch((err) =>
						res.json({
							status: 500,
							message: "Agent couldn't be created",
						})
					);
			}
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Agent couldn't be created",
			})
		);
});

// fetch agents for agent
router.post("/get", (req, res) => {
	Agent.findAll({
		where: {
			agentId: req.body.agentId,
			deleted: 0,
		},
	})
		.then((data) => {
			res.json({ data, status: 200 });
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Unknown error",
			})
		);
});

// institution fetch agent during activation to prepare payment
router.post("/inst", (req, res) => {
	Agent.findOne({
		where: {
			softwareId: req.body.softwareId,
		},
	})
		.then((agent) => {
			res.json({ agent, status: 200 });
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Unknown error",
			})
		);
});

module.exports = router;
