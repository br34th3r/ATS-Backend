// Initialisation of Modules and Express server
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');

// Grabbing LocalStrategy for Login Functionality
const LocalStrategy = require('passport-local').Strategy;

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

require('./components/Auth.js')(app, passport);
require('./components/UserRoutes.js')(app);
require('./components/BlankRoutes')(app);
require('./components/AssignmentRoutes')(app);
require('./components/CustomerRoutes')(app);
require('./components/TicketRoutes.js')(app);
require('./components/ReportsRoutes.js')(app);
require('./components/CommissionRoutes.js')(app);
require('./components/DatabaseRoutes.js')(app);

// Server setup to listen on a predefined port
app.listen(process.env.PORT, process.env.HOST);
console.log(`Listening on Port: ${process.env.PORT} and Host: ${process.env.HOST}`);
