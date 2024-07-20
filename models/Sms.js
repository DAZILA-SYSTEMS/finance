const Sequelize = require("sequelize");
const db = require("../config/database");

const Sms = db.define("sms", {
	bf: {
		type: Sequelize.STRING,
	},
	amount: {
		type: Sequelize.STRING,
	},
	cf: {
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
	credLinker: {
		type: Sequelize.STRING,
	},
	deleted: {
		type: Sequelize.STRING,
	},
});

Sms.sync().then(() => {
	console.log("sms table created");
});
module.exports = Sms;
