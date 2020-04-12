const User = require('../schemas/User');
const Agent = require('../schemas/Agent');

module.exports = function(app) {
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
  				userID: newUser._id
  			});

  			newAgent.save();
  		}
  		res.json("Accepted!");
  	}
  });
}
