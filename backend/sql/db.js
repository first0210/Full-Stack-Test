const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "firstpanupong",
  password: "12345",
  database: "feyverly_test",
  port: 3307,
});

module.exports = db;