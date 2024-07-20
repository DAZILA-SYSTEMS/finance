const Sequelize = require("sequelize");
const db = require("../config/database");

const Account = db.define("account", {
  name: {
    type: Sequelize.STRING,
  },
  details: {
    type: Sequelize.STRING,
  },
  details: {
    type: Sequelize.STRING,
  },
  type: {
    type: Sequelize.STRING,
  },
  rate: {
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

Account.sync().then(() => {
  console.log("account table created");
});
module.exports = Account;
