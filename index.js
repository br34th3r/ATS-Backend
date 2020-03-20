// Initialisation of Modules and Express server
const express = require('express');
const mysql = require('mysql');
const app = express();

// Initialise environment variables
require('dotenv').config()

// Create a Connection to the MySQL Database
var con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

// An example GET request sending plain text
app.get('/', (req, res) => {
	res.send("Backend for ATS System");
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
