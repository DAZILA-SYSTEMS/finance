const Sequelize = require("sequelize");
const db = require("../config/database");

const OnlinePayment = db.define("OnlinePayment", {
	transType: {
		type: Sequelize.STRING,
	},
	transMode: {
		type: Sequelize.STRING,
	},
	transContact: {
		type: Sequelize.STRING,
	},
	transId: {
		type: Sequelize.STRING,
	},
	transTime: {
		type: Sequelize.STRING,
	},
	transAmount: {
		type: Sequelize.STRING,
	},
	transSender: {
		type: Sequelize.STRING,
	},
	transReceiver: {
		type: Sequelize.STRING,
	},
	transRef: {
		type: Sequelize.STRING,
	},
	trace: {
		type: Sequelize.STRING,
	},
	live: {
		type: Sequelize.STRING,
	},
	linker: {
		type: Sequelize.STRING,
	},
	status: {
		type: Sequelize.STRING,
	},
	instLinker: {
		type: Sequelize.STRING,
	},
	deleted: {
		type: Sequelize.STRING,
	},
});

OnlinePayment.sync().then(() => {
	console.log("OnlinePayment table created");
});
module.exports = OnlinePayment;
