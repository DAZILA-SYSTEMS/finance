const Sequelize = require("sequelize");
const db = require("../config/database");

const Notification = db.define("notification", {
  title: {
    type: Sequelize.STRING,
  },
  note: {
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

Notification.sync().then(() => {
  console.log("notification table created");
});
module.exports = Notification;
