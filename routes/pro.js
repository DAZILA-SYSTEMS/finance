const express = require("express");
const router = express.Router();
const Sub = require("../models/Sub");
const Active = require("../models/Active");
const Inst = require("../models/Inst");
const Agent = require("../models/Agent");
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

function CreateActive(code, req, res) {
	//create a active
	Active.create({
		softwareId: `${parseInt(req.body.softwareId)}`.split("").reverse().join(""),
		transaction: req.body.transaction,
		userEmail: req.body.country,
		activation: code,
		live: 1,
		linker: Date.now(),
		trace: Date.now(),
		deleted: 0,
		status: 0,
	})
		.then((active) => {})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Active couldn't be created",
			})
		);
}

const UpdateActive = (code, req, res) => {
	Active.findOne({
		where: {
			id: req.body.id || Date.now(),
			deleted: 0,
		},
	})
		.then((active) => {
			if (active) {
				active.activation = code;
				active.status = 1;
				active.trace = Date.now();
				active.save();
				res.json({ active, status: 200 });
			} else {
				if (req.body.instLinker) {
				} else {
					res.json({
						status: 500,
						message: "Active couldn't be updated",
					});
				}
			}
		})
		.catch((err) => {
			res.json({
				status: 500,
				message: "Active couldn't be updated",
			});
		});
};

//submit agent commission for version 2
const AgentCommisionV2 = (amount, softwareId, currency, req, res) => {
	Agent.findOne({
		where: { softwareId },
	})
		.then((agent) => {
			if (!req.body.type) {
				req.body.type = !agent
					? req.body.amount > 503.9
						? "lifetime"
						: req.body.amount > 71.9
						? "annual"
						: req.body.amount > 35.9
						? "biannual"
						: req.body.amount > 17.9
						? "quarterly"
						: req.body.amount > 5.9
						? "monthly"
						: "none"
					: req.body.amount >= agent.dataValues.cost * 7
					? "lifetime"
					: req.body.amount >= agent.dataValues.cost
					? "annual"
					: req.body.amount >= agent.dataValues.cost / 2
					? "biannual"
					: req.body.amount >= agent.dataValues.cost / 4
					? "quarterly"
					: req.body.amount >= agent.dataValues.cost / 12
					? "monthly"
					: "none";
			}

			GenerateCodeV2(req, res);

			if (agent) {
				fetch(process.env.AGENT_URL, {
					headers: {
						"Content-Type": "application/json",
					},
					method: "POST",
					body: JSON.stringify({
						amount,
						agentId: agent.dataValues.agentId,
						softwareId,
						currency,
					}),
				})
					.then(() => {})
					.catch((err) => err);
			}
		})
		.catch();
};

//generate software activation code for version2
const GenerateCodeV2 = (req, res) => {
	Sub.count({
		where: {
			softwareId: req.body.softwareId,
		},
	})
		.then((count) => {
			let lifeSpan =
				366 *
				24 *
				60 *
				60 *
				(req.body.type === "lifetime" && req.body.amount > 503.9
					? 2
					: req.body.type === "annual" && req.body.amount > 71.9
					? 1
					: req.body.type === "biannual" && req.body.amount > 35.9
					? 1 / 2
					: req.body.type === "quarterly" && req.body.amount > 17.9
					? 1 / 4
					: req.body.type === "monthly" && req.body.amount > 5.9
					? 1 / 12
					: 0);

			let code = parseInt(req.body.softwareId) + lifeSpan * (count + 2);

			Sub.create({
				softwareId: req.body.softwareId,
				code,
				live: 1,
				linker: Date.now(),
				trace: Date.now(),
				deleted: 0,
				status: 0,
			})
				.then((sub) => {
					if (req.body.by === "mpesa") {
						CreateActive(code, req, res);
					} else {
						UpdateActive(code, req, res);
					}
					req.io
						.to(req.body.softwareId)
						.emit("message", { ...sub, messageType: "sub" });
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

//submit agent commission
const AgentCommision = (amount, softwareId, currency) => {
	Agent.findOne({
		where: { softwareId },
	})
		.then((agent) => {
			if (agent) {
				fetch(process.env.AGENT_URL, {
					headers: {
						"Content-Type": "application/json",
					},
					method: "POST",
					body: JSON.stringify({
						amount,
						agentId: agent.dataValues.agentId,
						softwareId,
						currency,
					}),
				})
					.then(() => {})
					.catch((err) => err);
			}
		})
		.catch();
};

//generate software activation code
const GenerateCode = (req, res) => {
	Sub.count({
		where: {
			softwareId: req.body.softwareId,
		},
	})
		.then((count) => {
			let code =
				(parseInt(req.body.softwareId) + parseInt(req.body.amount)) *
				(count + 2);
			Sub.create({
				softwareId: req.body.softwareId,
				code,
				live: 1,
				linker: Date.now(),
				trace: Date.now(),
				deleted: 0,
				status: 0,
			})
				.then((sub) => {
					if (req.body.by === "mpesa") {
						CreateActive(code, req, res);
						req.io
							.to(req.body.instLinker)
							.emit("message", { ...sub, messageType: "sub" });
					} else {
						UpdateActive(code, req, res);
					}
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

//confirm transaction code and generate activation code
router.post("/verify", (req, res) => {
	if (req.body.pro !== process.env.PRO_PASS) {
		return res.json({
			status: 500,
			message: "Unknown error",
		});
	}
	AgentCommision(req.body.amount, req.body.softwareId, req.body.currency);
	GenerateCode(req, res);
});

//v2 confirm transaction code and generate activation code
router.post("/verify-v2", (req, res) => {
	if (req.body.pro !== process.env.PRO_PASS) {
		return res.json({
			status: 500,
			message: "Unknown error",
		});
	}

	AgentCommisionV2(
		req.body.amount,
		req.body.softwareId,
		req.body.currency,
		req,
		res
	);
});

//mpesa verify
router.post("/verify-online/:type/:softwareId", (req, res) => {
	const merchantRequestID = req.body.Body.stkCallback.MerchantRequestID;
	const checkoutRequestID = req.body.Body.stkCallback.CheckoutRequestID;
	const resultCode = req.body.Body.stkCallback.ResultCode;
	const resultDesc = req.body.Body.stkCallback.ResultDesc;
	const callbackMetadata = req.body.Body.stkCallback.CallbackMetadata;
	const amount = callbackMetadata.Item[0].Value;
	const mpesaReceiptNumber = callbackMetadata.Item[1].Value;
	const transactionDate = callbackMetadata.Item[2].Value;
	const phoneNumber = callbackMetadata.Item[3].Value;

	req.body.softwareId = req.params.softwareId;
	req.body.amount = parseInt(amount / 130.345069); //parseInt(amount) === 15000 ? 99 : 29;
	req.body.transaction = mpesaReceiptNumber;
	req.body.country = `Kenya-${phoneNumber}`;
	req.body.by = "mpesa";
	req.body.type = req.params.type;
	// Send a success response if the transaction is valid
	const successResponse = {
		ResultCode: 0,
		ResultDesc: "Accepted",
	};
	res.json(successResponse);

	FetchExchanges()
		.then((data) => {
			if (data.rates) {
				AgentCommisionV2(
					amount / data.rates["KES"],
					req.params.softwareId,
					"Kshs",
					req,
					res
				);
			}
		})
		.catch((error) => {
			console.error("Error:", error);
		});
});

//get subs
router.post("/subs", (req, res) => {
	if (req.body.pro !== process.env.PRO_PASS) {
		return res.json({
			status: 500,
			message: "Unknown error",
		});
	}

	Sub.findAll({})
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

//get Actives subscriptions payments
router.post("/actives", (req, res) => {
	if (req.body.pro !== process.env.PRO_PASS) {
		return res.json({
			status: 500,
			message: "Unknown error",
		});
	}
	Active.findAll({})
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

//get Actives subscriptions payments
router.post("/edit", (req, res) => {
	if (req.body.pro !== process.env.PRO_PASS) {
		res.json({
			status: 500,
			message: "Unknown error",
		});
	}
	Active.findOne({
		where: {
			id: req.body.id,
		},
	})
		.then((active) => {
			if (active) {
				active.status = req.body.status;
				active.deleted = req.body.deleted;
				active.trace = Date.now();
				active.save();

				res.json({ active, status: 200 });
			} else {
				res.json({ status: 404, message: "Active not found" });
			}
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Active couldn't be edited",
			})
		);
});

//edit sub
router.post("/update", (req, res) => {
	if (req.body.pro !== process.env.PRO_PASS) {
		res.json({
			status: 500,
			message: "Unknown error",
		});
	}
	Sub.findOne({
		where: {
			id: req.body.id,
		},
	})
		.then((active) => {
			if (active) {
				active.deleted = req.body.deleted;
				active.trace = Date.now();
				active.save();

				res.json({ active, status: 200 });
			} else {
				res.json({ status: 404, message: "Sub not found" });
			}
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Sub couldn't be edited",
			})
		);
});

//get institutions
router.post("/insts", (req, res) => {
	if (req.body.pro !== process.env.PRO_PASS) {
		return res.json({
			status: 500,
			message: "Unknown error",
		});
	}

	Inst.findAll({})
		.then((insts) => {
			res.json({ insts, status: 200 });
		})
		.catch((err) => {
			res.json({
				status: 500,
				message: "Unknown error",
			});
		});
});

//edit agent
router.post("/edit-agent", (req, res) => {
	if (req.body.pro !== process.env.PRO_PASS) {
		return res.json({
			status: 500,
			message: "Unknown error",
		});
	}
	Agent.findOne({
		where: { id: req.body.id },
	})
		.then((agent) => {
			if (agent) {
				agent.softwareId = req.body.softwareId
					? req.body.softwareId
					: agent.softwareId;
				agent.cost = req.body.cost ? req.body.cost : agent.cost;
				agent.instName = req.body.instName ? req.boinstName : agent.instName;
				agent.deleted = req.body.deleted ? req.body.deleted : agent.deleted;
				agent.save();
				res.json({ agent, status: 200 });
			} else {
				res.json({ status: 404, message: "Agent not found" });
			}
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Agent couldn't be edited",
			})
		);
});

//get agents
router.post("/agents", (req, res) => {
	if (req.body.pro !== process.env.PRO_PASS) {
		return res.json({
			status: 500,
			message: "Unknown error",
		});
	}
	Agent.findAll({})
		.then((agents) => {
			res.json({ agents, status: 200 });
		})
		.catch((err) =>
			res.json({
				status: 500,
				message: "Unknown error",
			})
		);
});

module.exports = router;
