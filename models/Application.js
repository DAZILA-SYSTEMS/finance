const Sequelize = require("sequelize");
const db = require("../config/database");

const Application = db.define("application", {
  clientLinker: {
    type: Sequelize.STRING,
  },
  accountLinker: {
    type: Sequelize.STRING,
  },
  appliedAmount: {
    type: Sequelize.STRING,
  },
  approvedAmount: {
    type: Sequelize.STRING,
  },
  disbursedAmount: {
    type: Sequelize.STRING,
  },
  security: {
    type: Sequelize.STRING,
  },
  guarantors: {
    type: Sequelize.STRING,
  },
  principal: {
    type: Sequelize.STRING,
  },
  period: {
    type: Sequelize.STRING,
  },
  disburseDate: {
    type: Sequelize.STRING,
  },
  details: {
    type: Sequelize.STRING,
  },
  status: {
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
  instLinker: {
    type: Sequelize.STRING,
  },
  credLinker: {
    type: Sequelize.STRING,
  },
  branchLinker: {
    type: Sequelize.STRING,
  },
  deleted: {
    type: Sequelize.STRING,
  },
});

Application.sync().then(() => {
  console.log("application table created");
});
module.exports = Application;
