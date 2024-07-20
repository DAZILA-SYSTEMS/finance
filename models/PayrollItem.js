const Sequelize = require("sequelize");
const db = require("../config/database");

const PayrollItem = db.define("payrollItem", {
  amount: {
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
  catLinker: {
    type: Sequelize.STRING,
  },
  instLinker: {
    type: Sequelize.STRING,
  },
  credLinker: {
    type: Sequelize.STRING,
  },
  staffLinker: {
    type: Sequelize.STRING,
  },
  deleted: {
    type: Sequelize.STRING,
  },
});

PayrollItem.sync().then(() => {
  console.log("payrollItem table created");
});
module.exports = PayrollItem;
