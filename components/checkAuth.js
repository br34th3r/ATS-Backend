module.exports = {
  // Authentication functions for Individual Users
  isAuth: function (req, res, next) {
  	if(req.session.passport){
  		next();
  	} else {
  		res.send("Failure Unauthorised!");
  	}
  },

  isAgent: function (req, res, next) {
  	User.findById(req.session.passport.user, (err, doc) => {
  		if (err) throw err;
  		if (doc.access == "AGENT") {
  			next();
  		} else {
  			res.send("Failure, Unauthorised Access!");
  		}
  	});
  },

  isManager: function (req, res, next) {
  	User.findById(req.session.passport.user, (err, doc) => {
  		if (err) throw err;
  		if (doc.access == "MANAGER") {
  			next();
  		} else {
  			res.send("Failure, Unauthorised Access!");
  		}
  	});
  },

  isAdmin: function (req, res, next) {
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
}
