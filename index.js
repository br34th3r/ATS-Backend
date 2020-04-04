// Initialisation of Modules and Express server
const express = require('express');
const SHA256 = require('crypto-js/sha256');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
const User =  require('./schemas/User');

const app = express();

// Initialise environment variables
require('dotenv').config();

// Authentication Configuration
passport.use(new LocalStrategy((username, password, done) => {
	User.findOne({ username: username }, (err, user) => {
		if (err) { return done(err); }
		if (!user) {
			return done(null, false, { message: "Incorrect Username!" });
		}
		if (!user.validPassword(password)) {
			return done(null, false, { message: "Incorrect Password!" });
		}
		return done(null, user);
	})
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Connect to MongoDB
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Express Middleware Initialisation
app.use(session({ secret: "th1rt33n" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// An example GET request sending plain text
app.get('/', (req, res) => {
	res.send("Backend for ATS System");
  conn.query("SELECT * FROM blanks");
});

// Add a New User
app.post('/addUser', (req, res) => {
	if (req.query.username && req.query.password && req.query.access) {
		let newUser = new User({
			username: req.query.username,
		  password: req.query.password,
		  access: req.query.access
		});

		newUser.save();
		res.json("Accepted!");
	}
});

// Handle User Login
app.post('/login', passport.authenticate('local', {
	successRedirect: '/success',
	failureRedirect: '/failed'
}));

app.get('/success', (req, res) => {
	console.log("S");
	res.send("Success!");
});

app.get('/failed', (req, res) => {
	console.log("F");
	res.send("Failure!");
})

// Get all the blanks 
app.get('/blanks', (req, res) => {
	res.send("All the blanks");
  //conn.query("SELECT * FROM blanks");
});

// Add a Blank
app.post('/addBlank', (req, res) => {
	console.log("Add a blank");
});

// Remove a Blank
app.delete('/removeBlank/:blankdID', (req, res) => {
	console.log("Removes a blank");
	// Important can't remove blank that is assigned to agent
});

// Get blanks by a type
app.get('/blanks/type/:type', (req, res) => {
	res.send("Get blanks by a type");
});

// Get a Blank
app.get('/blanks/:blankID', (req, res) => {
	res.send("Get blank");
});

// Assign/Reassign a Blank
app.patch('/blanks/:blankID', (req, res) => {
	console.log("Assign a Blank to a TA");
});

// Get Blanks assigned to the travel agent
app.get('/:travelAgent/blanks', (req, res) => {
	res.send("Get travel agent's blanks");
});

// Create a customer account
app.post('/addCustomer', (req, res) => {
	console.log("Create a customer account");
});

// Get all the customers
app.get('/customers', (req, res) => {
	console.log("Get all customers");
});

// Get a customer
app.get('/customers/:customerID', (req, res) => {
	console.log("Get a customer");
});

// Edit discount plan
app.patch('/customers/:customerID', (req, res) => {
	console.log("Edit discount plan");
});

// Record a sold ticket
app.post('/addSoldTicket', (req, res) => {
	console.log("Record sold ticket");
});

// Generate a stock turnover report
app.post('/stockReport', (req, res) => {
	console.log("Generate a stock turnover report");
});

// Generate an individual interline sales report
app.post('/interlineSalesReport/:travelAgent', (req, res) => {
	console.log("Generate an individual interline sales report");
});

// Generate an individual domestic sales report
app.post('/domesticSalesReport/:travelAgent', (req, res) => {
	console.log("Generate an individual domestic sales report");
});

// Generate a global interline sales report per advisor
app.post('/globalInterlineSalesReport/advisor', (req, res) => {
	console.log("Generate a global interline sales report per advisor");
});

// Generate a global interline sales report per USD rate
app.post('/globalInterlineSalesReport/USD', (req, res) => {
	console.log("Generate a global interline sales report per USD rate");
});

// Generate a global domestic sales report
app.post('/globalDomesticSalesReport', (req, res) => {
	console.log("Generate a global interline sales report per USD rate");
});

// Add commission rate
app.post('/addCommisionRate', (req, res) => {
	console.log("Add commission rate");
});

// Edit commission rate
app.patch('/editCommissionRate', (req, res) => {
	console.log("Edit commission rate");
});

// TO DO'S
// Back up and restore db
// Ability to print report
// Refund a ticket, data entered and saved correctly in a log file not DB (not sure what to do for that)

// Server setup to listen on a predefined port
app.listen(process.env.PORT, process.env.HOST);
console.log(`Listening on Port: ${process.env.PORT} and Host: ${process.env.HOST}`);
