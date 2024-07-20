const Sequelize = require("sequelize");
const db = require("../config/database");

//for submitted payments for activation code
const Active = db.define("active", {
  activation: {
    type: Sequelize.STRING,
  },
  transaction: {
    type: Sequelize.STRING,
  },
  userEmail: {
    type: Sequelize.STRING,
  },
  softwareId: {
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
  deleted: {
    type: Sequelize.STRING,
  },
});

Active.sync().then(() => {
  console.log("activity table created");
});
module.exports = Active;
