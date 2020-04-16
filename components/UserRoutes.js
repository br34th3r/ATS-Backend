const User = require('../schemas/User');
const Agent = require('../schemas/Agent');

module.exports = function(app) {
  // Add a New User
  app.post('/addUser', (req, res) => {
  	if (req.body.username && req.body.password && req.body.access) {
  		let newUser = new User({
  			username: req.body.username,
  		  password: req.body.password,
  		  access: req.body.access
  		});
  		newUser.save();

  		if (req.body.access == "AGENT") {
  			let newAgent = new Agent({
  				name: req.body.name,
  				userID: newUser._id
  			});

  			newAgent.save();
  		}
  		res.status(200).json({ ok: true });
  	} else {
      res.status(400).json({ errors: "Invalid Query!" });
    }
  });
}
