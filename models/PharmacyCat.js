const Sequelize = require("sequelize");
const db = require("../config/database");

const PharmacyCat = db.define("pharmacyCat", {
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

PharmacyCat.sync().then(() => {
  console.log("pharmacyCat table created");
});
module.exports = PharmacyCat;
