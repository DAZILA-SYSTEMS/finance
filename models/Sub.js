const Sequelize = require("sequelize");
const db = require("../config/database");

const Sub = db.define("sub", {
  softwareId: {
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

Sub.sync().then(() => {
  console.log("sub table created");
});
module.exports = Sub;
