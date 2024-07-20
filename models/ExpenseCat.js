const Sequelize = require("sequelize");
const db = require("../config/database");

const ExpenseCat = db.define("expenseCat", {
  name: {
    type: Sequelize.STRING,
  },
  details: {
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

ExpenseCat.sync().then(() => {
  console.log("expenseCat table created");
});
module.exports = ExpenseCat;
