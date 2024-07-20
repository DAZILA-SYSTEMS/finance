const Sequelize = require("sequelize");
const db = require("../config/database");

const Entry = db.define("entry", {
  amount: {
    type: Sequelize.STRING,
  },
  details: {
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
  type: {
    type: Sequelize.STRING,
  },
  accountLinker: {
    type: Sequelize.STRING,
  },
  clientLinker: {
    type: Sequelize.STRING,
  },
  branchLinker: {
    type: Sequelize.STRING,
  },
  modeLinker: {
    type: Sequelize.STRING,
  },
  instLinker: {
    type: Sequelize.STRING,
  },
  credLinker: {
    type: Sequelize.STRING,
  },
  code: {
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

Entry.sync().then(() => {
  console.log("entry table created");
});
module.exports = Entry;
