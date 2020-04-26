// Initialisation of Modules and Express server
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const cors = require('cors');
const MongoStore = require('connect-mongo')(session);

// Grabbing LocalStrategy for Login Functionality
const LocalStrategy = require('passport-local').Strategy;
const User = require('./schemas/User');

// Start Express Server Instance
const app = express();

// Initialise environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Database Connection Error:'));
db.once('open', function() {
  console.log("Database Connection Established!");
});

// Authentication Configuration
passport.use(new LocalStrategy((username, password, done) => {
	User.findOne({ username: username }, (err, user) => {
		if (err) { console.log(err); return done(err); }
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
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Express Middleware Initialisation
app.use(cookieParser());
app.use(session({
	secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie : {
    maxAge: 3600000 // see below
  },
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8000')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-AUTHENTICATION, X-IP, Content-Type, Accept')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
});

require('./components/Auth.js')(app, passport);

require('./components/UserRoutes.js')(app);
require('./components/BlankRoutes')(app);
require('./components/AssignmentRoutes')(app);
require('./components/CustomerRoutes')(app);
require('./components/TicketRoutes.js')(app);
require('./components/ReportsRoutes.js')(app);
require('./components/CommissionRoutes.js')(app);
require('./components/DatabaseRoutes.js')(app);
require('./components/TimeEvents.js')(app);

// Server setup to listen on a predefined port
app.listen(process.env.PORT, process.env.HOST);
console.log(`Listening on Port: ${process.env.PORT} and Host: ${process.env.HOST}`);
