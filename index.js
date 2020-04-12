// Initialisation of Modules and Express server
const express = require('express');
const SHA256 = require('crypto-js/sha256');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
const spawn = require('child_process').spawn;
const fs = require('fs');

// Define Schemas
const User =  require('./schemas/User');
const Blank = require('./schemas/Blank');
const Customer = require('./schemas/Customer');
const Ticket = require('./schemas/Ticket');
const Commission = require('./schemas/Commission');
const Agent = require('./schemas/Agent');

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

// Add a New User
app.post('/addUser', (req, res) => {
	if (req.query.username && req.query.password && req.query.access) {
		let newUser = new User({
			username: req.query.username,
		  password: req.query.password,
		  access: req.query.access
		});
		newUser.save();

		if (req.query.access == "AGENT") {
			let newAgent = new Agent({
				name: req.query.name,
				email: req.query.email,
				userID: newUser._id
			});

			newAgent.save();
		}
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
app.post('/addBlanks', (req, res) => {
	if (req.query.type && req.query.start && req.query.end) {
		for (var i = parseInt(req.query.end); i >= req.query.start; i--) {
			let newBlank = new Blank({
				type: req.query.type,
			  isValid: true,
			  AgentID: null,
				number: i.toString().padStart(8, "0")
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
		if (doc != null) {
			if (doc.AgentID == null) {
				Blank.findByIdAndRemove({_id: doc._id}, (err, offer) => {
					if (err) throw err;
					console.log("Blank Removed!");
					res.send("Blank Removed!");
				});
			} else {
				res.send("Failure, Blank is Assigned!");
			}
		}
	});
});

// Bulk Remove Blanks
app.delete('/removeBlanks/:start/:end', (req, res) => {
	for (var i = parseInt(req.params.start); i <= parseInt(req.params.end); i++) {
		Blank.findOne({ number: i.toString().padStart(8, "0") }, (err, blank) => {
			if (err) throw err;
			if (blank != null) {
				if (blank.AgentID == null) {
					Blank.findByIdAndRemove({_id: blank._id}, (err, offer) => {
						if (err) throw err;
					});
				}
			}
		});
	}
	console.log("Removal Terminated!");
	res.send("Removal Terminated!");
});

// Get blanks by a type
app.get('/blanks/type/:type', (req, res) => {
	Blank.find({ type: req.params.type }, (err, docs) => {
		if (err) throw err;
		res.json(docs);
		console.log("Sent Blanks of Type");
	});
});

// Get a Blank by ID
app.get('/blanks/id/:blankID', (req, res) => {
	Blank.findById(req.params.blankID, (err, doc) => {
		if (err) throw err;
		res.json(doc);
		console.log("Found Blank by ID");
	});
});

// Get a Blank by Number
app.get('/blanks/number/:type/:number', (req, res) => {
	Blank.find({ type: req.params.type, number: req.params.number.toString().padStart(8, "0") }, (err, doc) => {
		if (err) throw err;
		res.json(doc);
		console.log("Retrieved Blank by Number");
	});
});

// Assign/Reassign a Blank
app.patch('/blanks/assign/:start/:end/:agentID', (req, res) => {
	for (var i = parseInt(req.params.end); i <= parseInt(req.params.start); i--) {
		Blank.findOneAndUpdate({ number: i.toString().padStart(8, "0") }, { AgentID: req.params.agentID });
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
	Customer.findOneAndUpdate({ _id: req.params.customerID }, { discountStatus: req.params.discountType });
	res.send("Updated Customer Discount Status!");
	console.log("Updated Customer Discount Status!");
});

// Record a sold ticket
app.post('/addSoldTicket', (req, res) => {
	if (req.query.saleType && req.query.paymentMethod && req.query.blankID && req.query.customerID && req.query.from && req.query.to && req.query.localTax && req.query.commissionID && req.query.saleDate && req.query.payLater) {
		ExchangeRate.findOne({}, (err, rate) => {
			if(rate != null) {
				Customer.findOne({ _id: req.query.customerID }, (err, customer) => {
					if (customer != null) {
						Commission.findOne({ _id: req.query.commissionID }, (err, commission) => {
							if (commission != null) {
								Blank.findOne({ _id: req.query.blankID }, (err, blank) => {
									if (blank != null) {
										Payment.findOneOrCreate({
											type: req.query.paymentMethod,
										  cardNumber: req.query.cardNumber ? req.query.cardNumber : null,
										  expiryDate: req.query.cardExpiry ? req.query.cardExpiry : null,
										  cvc: req.query.cvc ? req.query.cvc : null,
										  issuer: req.query.cardIssuer ? req.query.cardIssuer : null,
										  customerID: req.query.customerID
										}, (err, payment) => {
											if (err) throw err;
											if (rate != null) {
												let newSale = new Sale({
													saleType: req.query.saleType,
													isPaid: !req.query.payLater,
													costLocal: req.query.costLocal ? req.query.costLocal : null,
													costUSD: req.query.costUSD ? req.query.costUSD : null,
													localTaxes: req.query.localTax,
													otherTaxes: req.query.otherTax ? req.query.otherTax : null,
													currentRate: rate._id,
													commission: commission._id,
													agentID: req.session.passport.user,
													paymentID: payment._id,
													customerID: customer._id,
													blankID: blank._id
												});

												newSale.save();
												res.send("Added new sale!");
											} else {
												res.send("Error, Exchange Rate not Found!");
											}
										});

										blank.sold = true;
										blank.save();
									} else {
										res.send("Error, Blank not Found!");
									}
								});
							} else {
								res.send("Error, Commission not Found!");
							}
						});
					} else {
						res.send("Error, Customer not Found!");
					}
			});
			} else {
				res.send("Error, Exchange Rate not Found!");
			}
		});
	} else {
		res.send("Invalid Query!");
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
app.post('/addCommisionRate', (req, res) => {
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
	Commission.findOneAndUpdate({ blankType: req.query.blankType }, { amount: req.query.amount });
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
    console.log(data.toString());
  });
  mongodump.on('exit', function (code) {
    console.log('Finished');
  });
	res.send("Finished Backing Up!");
});

app.get('/database/restore/:backup', (req, res) => {
	var args = [ "--drop", req.params.backup + "/" ]
      , mongodump = spawn('/usr/local/bin/mongorestore', args);
  mongodump.stdout.on('data', function (data) {
		console.log("Restored!");
  });
  mongodump.stderr.on('data', function (data) {
    console.log(data.toString());
  });
  mongodump.on('exit', function (code) {
    console.log('Finished');
  });
	res.send("Finished Restoring!");
});

app.post('/ticket/:ticketID/refund', (req, res) => {
	Ticket.findById(req.params.ticketID, (err, ticket) => {
		if (err) throw err;
		if (ticket != null) {
			let refundData = {
				datetime: Date.now(),
				ticketID: req.params.ticketID,
			}
			fs.writeFileSync(`/refunds/${req.params.ticketID}`, JSON.stringify(refundData));
			ticket.isValid = false;
			ticket.save();
			res.send("Confirmed Refund!");
		} else {
			res.send("Ticket returned Null");
		}
	});
});

// Server setup to listen on a predefined port
app.listen(process.env.PORT, process.env.HOST);
console.log(`Listening on Port: ${process.env.PORT} and Host: ${process.env.HOST}`);
