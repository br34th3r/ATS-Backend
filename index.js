// Initialisation of Modules and Express server
const express = require('express');
const SHA256 = require('crypto-js/sha256');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');

// Define Schemas
const User =  require('./schemas/User');
const Blank = require('./schemas/Blank');
const Customer = require('./schemas/Customer');
const Ticket = require('./schemas/Ticket');
const Commission = require('./schemas/Commission');

// Start Express Server Instance
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
db.on('error', console.error.bind(console, 'Database Connection Error:'));
db.once('open', function() {
  console.log("Database Connection Established!");
});

// Express Middleware Initialisation
app.use(session({ secret: "th1rt33n" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

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
	console.log("Successful Login!");
	res.send("Success!");
});

app.get('/failed', (req, res) => {
	console.log("Failed Login!");
	res.send("Failure!");
})

// Get all the blanks
app.get('/blanks', (req, res) => {
	console.log("Returning all Blanks");
	Blank.find({}, (err, docs) => {
		if (err) { res.send(err); }
		res.send(docs);
		console.log("Blanks Returned!");
	});
});

// Add a Blank
app.post('/addBlank', (req, res) => {
	console.log(req.query);
	if (req.query.type && req.query.description) {
		let newBlank = new Blank({
			type: req.query.type,
		  description: req.query.description,
		  isValid: true,
		  AgentID: null
		});

		newBlank.save();
		res.send("Blank Added!");
		console.log("Added Blank!");
	}
});

// Remove a Blank
app.delete('/removeBlank/:blankID', (req, res) => {
	Blank.findOne({ _id: req.params.blankID }, (err, doc) => {
		if (err) throw err;
		if (doc != []) {
			if (doc.AgentID == null) {
				Blank.findByIdAndRemove({_id: req.params.blankID}, (err, offer) => {
					if (err) throw err;
					console.log("Blank Removed!");
					res.send("Blank Removed!");
				});
			}
		}
	});
});

// Get blanks by a type
app.get('/blanks/type/:type', (req, res) => {
	Blank.find({ type: req.params.type }, (err, docs) => {
		if (err) throw err;
		res.json(docs);
		console.log("Sent Blanks of Type");
	});
});

// Get a Blank
app.get('/blanks/:blankID', (req, res) => {
	Blank.findById(req.params.blankID, (err, doc) => {
		if (err) throw err;
		res.json(doc);
		console.log("Found Blank by ID");
	});
});

// Assign/Reassign a Blank
app.patch('/blanks/:blankID/assign/:agentID', (req, res) => {
	Blank.updateOne({ _id: req.params.blankID }, { AgentID: req.params.agentID });
	res.send("Assigned Blank to Agent!");
	console.log("Assigned Blank to Agent!")
});

// Get Blanks assigned to the travel agent
app.get('/:agentID/blanks', (req, res) => {
	Blank.find({ AgentID: req.params.agentID }, (err, docs) => {
		if (err) throw err;
		res.json(docs);
		console.log("Sent Agent Blanks!");
	});
});

// Create a customer account
app.post('/addCustomer', (req, res) => {
	if (req.query.name && req.query.surname && req.query.alias && req.query.email) {
		let newCustomer = new Customer({
			name: req.query.name,
		  surname: req.query.surname,
		  alias: req.query.alias,
			customerStatus: false,
			email: req.query.email,
			payments: [],
			balance: 0
		});

		newCustomer.save();
		res.json("New Customer Added!");
	}
});

// Get all the customers
app.get('/customers', (req, res) => {
	Customer.find({}, (err, docs) => {
		if (err) throw err;
		res.send(docs);
		console.log("Returned All Customers!");
	});
});

// Get a customer
app.get('/customers/:customerID', (req, res) => {
	Customer.findById(req.params.customerID, (err, doc) => {
		if (err) throw err;
		res.json(doc);
		console.log("Returned Customer by ID");
	});
});

// Edit discount plan
app.patch('/customers/:customerID/discount/:discountType', (req, res) => {
	Customer.updateOne({ _id: req.params.customerID }, { discountStatus: req.params.discountType });
	res.send("Updated Customer Discount Status!");
	console.log("Updated Customer Discount Status!");
});

// Record a sold ticket
app.post('/addSoldTicket', (req, res) => {
	if (req.query.departure && req.query.destination && req.query.saleDate && req.query.blankID && req.query.customerID) {
		let newTicket = new Ticket({
			isValid: true,
		  departure: req.query.departure,
		  destination: req.query.destination,
		  saleDate: req.query.saleDate,
		  blankID: req.query.blankID,
		  customerID: req.query.customerID
		});

		newTicket.save();
		res.json("New Ticket Added!");
	}
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
app.post('/addCommissionRate', (req, res) => {
	if (req.query.amount && req.query.blankType) {
		let newCommission = new Commission({
			amount: req.query.amount,
			blankType: req.query.blankType
		});

		newCommission.save();
		console.log("Added New Commission!");
		res.send("Added new Commission!");
	}
});

// Edit commission rate
app.patch('/editCommissionRate', (req, res) => {
	Commission.updateOne({ blankType: req.query.blankType }, { amount: req.query.amount });
	console.log("Updated Commission Rate!");
	res.send("Updated Commission Rate!");
});

// TO DO'S
// Back up and restore db
// Ability to print report
// Refund a ticket, data entered and saved correctly in a log file not DB (not sure what to do for that)

// Server setup to listen on a predefined port
app.listen(process.env.PORT, process.env.HOST);
console.log(`Listening on Port: ${process.env.PORT} and Host: ${process.env.HOST}`);
