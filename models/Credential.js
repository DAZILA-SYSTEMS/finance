const Sequelize = require("sequelize");
const db = require("../config/database");

const Credential = db.define("credential", {
  clientReg: {
    type: Sequelize.STRING,
  },
  staffReg: {
    type: Sequelize.STRING,
  },
  firstname: {
    type: Sequelize.STRING,
  },
  lastname: {
    type: Sequelize.STRING,
  },
  surname: {
    type: Sequelize.STRING,
  },
  contact: {
    type: Sequelize.STRING,
  },
  email: {
    type: Sequelize.STRING,
  },
  credLinker: {
    type: Sequelize.STRING,
  },
  instLinker: {
    type: Sequelize.STRING,
  },
  branchLinker: {
    type: Sequelize.STRING,
  },
  groupLinker: {
    type: Sequelize.STRING,
  },
  client: {
    type: Sequelize.TEXT,
  },
  staff: {
    type: Sequelize.TEXT,
  },
  admin: {
    type: Sequelize.STRING,
  },
  nokName: {
    type: Sequelize.STRING,
  },
  nokContact: {
    type: Sequelize.STRING,
  },
  location: {
    type: Sequelize.STRING,
  },
  income: {
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
  deleted: {
    type: Sequelize.STRING,
  },
  token: {
    type: Sequelize.STRING,
  },
  socket: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
  },
});

Credential.sync().then(() => {
  console.log("credential table created");
});
module.exports = Credential;
