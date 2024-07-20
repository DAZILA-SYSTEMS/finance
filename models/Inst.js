const Sequelize = require("sequelize");
const db = require("../config/database");

const Inst = db.define("inst", {
  name: {
    type: Sequelize.STRING,
  },
  motto: {
    type: Sequelize.TEXT,
  },
  email: {
    type: Sequelize.STRING,
  },
  contact: {
    type: Sequelize.STRING,
  },
  website: {
    type: Sequelize.STRING,
  },
  vision: {
    type: Sequelize.TEXT,
  },
  mission: {
    type: Sequelize.TEXT,
  },
  corevalues: {
    type: Sequelize.TEXT,
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
  sub: {
    type: Sequelize.STRING, //Holds country value
  },
  clientId: {
    type: Sequelize.STRING,
  },
  userLinker: {
    type: Sequelize.STRING,
  },
  deleted: {
    type: Sequelize.STRING,
  },
});

Inst.sync().then(() => {
  console.log("inst table created");
});
module.exports = Inst;
