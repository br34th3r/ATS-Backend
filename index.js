// Initialisation of Modules and Express server
const express = require('express');
const app = express();
const MysqlConnection = require('./classes/MysqlConnection.js');

// Initialise environment variables
require('dotenv').config()

// Create a Connection to the MySQL Database
var conn = new MysqlConnection();
conn.init();

// An example GET request sending plain text
app.get('/', (req, res) => {
	res.send("Backend for ATS System");
  conn.query("SELECT * FROM blanks");
});

// An example POST request sending json
app.post('/test', (req, res) => {
	let jsonResponse = {
		"Accept": true
	}
	res.json(jsonResponse);
});

// Server setup to listen on a predefined port
app.listen(process.env.PORT, () => console.log('Listening on port: ' + process.env.PORT));
