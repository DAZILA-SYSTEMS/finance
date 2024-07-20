const Sequelize = require("sequelize");
const db = require("../config/database");

const Agent = db.define("agent", {
  agentId: {
    type: Sequelize.STRING,
  },
  softwareId: {
    type: Sequelize.STRING,
  },
  instName: {
    type: Sequelize.STRING,
  },
  cost: {
    type: Sequelize.STRING,
  },
  contact: {
    type: Sequelize.STRING,
  },
  email: {
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

Agent.sync().then(() => {
  console.log("agent table created");
});
module.exports = Agent;
