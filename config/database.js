const Sequelize = require("sequelize");
//const dotenv = require('dotenv');

//dotenv.config();

module.exports = new Sequelize({
  username: process.env.dbname,
  password: process.env.password,
  host: process.env.host,
  database: process.env.database,
  dialect: "mysql",
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
