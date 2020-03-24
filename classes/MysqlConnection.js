const mysql = require('mysql');

class MysqlConnection {
  constructor() {
    this.host = process.env.DB_HOST;
    this.port = 3306;
    this.user = process.env.DB_USER;
    this.password = process.env.DB_PASS;
    this.db = "ats_db";
  }

  init() {
    this.connection = mysql.createConnection({
      host: this.host,
      port: this.port,
      user: this.user,
      password: this.password,
      database: this.db
    });

    this.connection.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
  }

  query(qString) {
    this.connection.query(qString, function (err, result) {
      if (err) throw err;
      console.log(result[0].id);
    });
  }
}

module.exports = MysqlConnection;
