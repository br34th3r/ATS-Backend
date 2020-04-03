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

// Server setup to listen on a predefined port
app.listen(process.env.PORT, process.env.HOST);
console.log(`Listening on Port: ${process.env.PORT} and Host: ${process.env.HOST}`);
