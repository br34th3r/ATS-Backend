module.exports = {
  // Authentication functions for Individual Users
  isAuth: function (req, res, next) {
  	if(req.session.passport){
  		next();
  	} else {
  		res.status(400).json({ errors: "Failure Unauthorised!" });
  	}
  },

  isAgent: function (req, res, next) {
  	User.findById(req.session.passport.user, (err, doc) => {
  		if (err) throw err;
  		if (doc.access == "AGENT") {
  			next();
  		} else {
  			res.status(400).json({ errors: "Failure, you are not an agent!" });
  		}
  	});
  },

  isManager: function (req, res, next) {
  	User.findById(req.session.passport.user, (err, doc) => {
  		if (err) throw err;
  		if (doc.access == "MANAGER") {
  			next();
  		} else {
  			res.status(400).json({ errors: "Failure, you are not a manager!" });
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
  			res.status(400).json({ errors: "Failure, you are not an admin!" });
  		}
  	});
  }
}
