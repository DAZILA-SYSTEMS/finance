const Sequelize = require("sequelize");
const db = require("../config/database");

const Online = db.define("online", {
  identity: {
    type: Sequelize.STRING,
  },
  type: {
    type: Sequelize.STRING,
  },
  key1: {
    type: Sequelize.STRING,
  },
  key2: {
    type: Sequelize.STRING,
  },
  key3: {
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

Online.sync().then(() => {
  console.log("online table created");
});
module.exports = Online;
