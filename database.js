var Sequelize = require('sequelize');

// DB Config
var conf = {
  db: process.env.DB_NAME,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  connection: {
    host: process.env.DB_HOST,
    dialect: 'postgres',
  }
};

var sqlz = new Sequelize(conf.db, conf.user, conf.pass, conf.connection);


// Models
var Prospect = sqlz.define('prospect', {
  firstname: Sequelize.STRING,
  lastname: Sequelize.STRING,
  email: Sequelize.STRING,
  description: Sequelize.TEXT
}, {
  freezeTableName: true
});
Prospect.sync(); // Migrates DB


// Exports
module.exports = {
  Prospect: Prospect,
  conf: conf,
  sqlz: sqlz
};

