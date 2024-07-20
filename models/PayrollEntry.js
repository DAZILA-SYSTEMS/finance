const Sequelize = require("sequelize");
const db = require("../config/database");

const PayrollEntry = db.define("payrollEntry", {
  month: {
    type: Sequelize.STRING,
  },
  details: {
    type: Sequelize.STRING,
  },
  amount: {
    type: Sequelize.STRING,
  },
  itemLinker: {
    type: Sequelize.STRING,
  },
  staffLinker: {
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

PayrollEntry.sync().then(() => {
  console.log("payrollEntry table created");
});
module.exports = PayrollEntry;
