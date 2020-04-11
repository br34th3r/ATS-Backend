// Initialisation of Modules and Express server
const express = require('express');
const SHA256 = require('crypto-js/sha256');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
const spawn = require('child_process').spawn;

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
app.use(session({
	secret: "th1rt33n",
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// Authentication functions for Individual Users
function isAuth(req, res, next) {
	if(req.session.passport){
		next();
	} else {
		res.send("Failure Unauthorised!");
	}
}

function isAgent(req, res, next) {
	User.findById(req.session.passport.user, (err, doc) => {
		if (err) throw err;
		if (doc.access == "AGENT") {
			next();
		} else {
			res.send("Failure, Unauthorised Access!");
		}
	});
}

function isManager(req, res, next) {
	User.findById(req.session.passport.user, (err, doc) => {
		if (err) throw err;
		if (doc.access == "MANAGER") {
			next();
		} else {
			res.send("Failure, Unauthorised Access!");
		}
	});
}

function isAdmin(req, res, next) {
	User.findById(req.session.passport.user, (err, doc) => {
		if (err) throw err;
		console.log(doc);
		if (doc.access == "ADMIN") {
			next();
		} else {
			res.send("Failure, Unauthorised Access!");
		}
	});
}

app.get('/', (req, res) => {
	console.log(req.session);
	res.send(req.session);
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
	console.log("Successful Login!");
	res.send("Success!");
});

app.get('/failed', (req, res) => {
	console.log("Failed Login!");
	res.send("Failure!");
})

// Get all the blanks
app.get('/blanks', (req, res) => {
	Blank.find({}, (err, docs) => {
		if (err) { res.send(err); }
		res.send(docs);
		console.log("Blanks Returned!");
	});
});

// Add a Blank
app.post('/addBlank', (req, res) => {
	if (req.query.type && req.query.start && req.query.end) {
		for (var i = parseInt(req.query.end); i > req.query.start; i--) {
			let newBlank = new Blank({
				type: req.query.type,
			  isValid: true,
			  AgentID: null,
				number: i
			});

			newBlank.save();
		}
		res.send("Blank(s) Added!");
		console.log("Added Blank(s)!");
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

// Bulk Remove Blanks
app.delete('/removeBlanks/:start/:end', (req, res) => {
	for (var i = parseInt(req.params.start); i <= parseInt(req.params.end); i++) {
		Blank.findOneAndRemove({ number: i }, (err, offer) => {
			if (err) throw err;
		});
	}
	res.send("Removed Blanks!");
	console.log("Removed Blanks!");
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
app.patch('/blanks/:start/:end/assign/:agentID', (req, res) => {
	for (var i = parseInt(req.params.end); i >= parseInt(req.params.start); i--) {
		Blank.updateOne({ number: i }, { AgentID: req.params.agentID });
	}
	res.send("Assigned Blank(s) to Agent!");
	console.log("Assigned Blank(s) to Agent!")
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
		Blank.findById(req.query.blankID, (err, doc) => {
			if (err) throw err;
			if(doc.agentID != null) {
				let newTicket = new Ticket({
					isValid: true,
				  departure: req.query.departure,
				  destination: req.query.destination,
				  saleDate: req.query.saleDate,
				  blankID: req.query.blankID,
				  customerID: req.query.customerID
				});

				newTicket.save();
				Blank.updateOne({ _id: doc._id }, { sold: true });
				res.json("New Ticket Added!");
			} else {
				res.json("Blank Cannot be Sold as it Has Not Been Assigned")
			}
		});
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

app.get('/database/backup', (req, res) => {
	var datetime = Date.now();
	var args = ['--db', 'ats-db', '--out', datetime ]
      , mongodump = spawn('/usr/local/bin/mongodump', args);
  mongodump.stdout.on('data', function (data) {
		console.log("Backed Up!");
  });
  mongodump.stderr.on('data', function (data) {
    console.log('MongoDump Error: ' + data);
  });
  mongodump.on('exit', function (code) {
    console.log('mongodump exited with code ' + code);
  });
	res.send("Finished Backing Up!");
});

app.get('/database/restore/:backup', (req, res) => {
	var args = [ req.params.backup + "/" ]
      , mongodump = spawn('/usr/local/bin/mongorestore', args);
  mongodump.stdout.on('data', function (data) {
		console.log("Restored!");
  });
  mongodump.stderr.on('data', function (data) {
    console.log('MongoRestore Error: ' + data);
  });
  mongodump.on('exit', function (code) {
    console.log('mongorestore exited with code ' + code);
  });
	res.send("Finished Restoring!");
});

app.get('/ticket/:ticketID/refund', (req, res) => {
	Ticket.findById(req.params.ticketID, (err, doc) => {
		console.log("Ticket");
		res.send("Ticket");
	});
});

// TO DO'S
// Ability to print report
// Refund a ticket, data entered and saved correctly in a log file not DB (not sure what to do for that)
// Adding new payment Type
//

// Server setup to listen on a predefined port
app.listen(process.env.PORT, process.env.HOST);
console.log(`Listening on Port: ${process.env.PORT} and Host: ${process.env.HOST}`);
