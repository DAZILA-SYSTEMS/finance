const Sequelize = require("sequelize");
const db = require("../config/database");

const Expense = db.define("expense", {
  name: {
    type: Sequelize.STRING,
  },
  details: {
    type: Sequelize.STRING,
  },
  amount: {
    type: Sequelize.STRING,
  },
  mode: {
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
  catLinker: {
    type: Sequelize.STRING,
  },
  instLinker: {
    type: Sequelize.STRING,
  },
  branchLinker: {
    type: Sequelize.STRING,
  },
  credLinker: {
    type: Sequelize.STRING,
  },
  deleted: {
    type: Sequelize.STRING,
  },
});

Expense.sync().then(() => {
  console.log("expense table created");
});
module.exports = Expense;
