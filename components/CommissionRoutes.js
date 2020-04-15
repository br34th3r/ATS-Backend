const Commission = require('../schemas/Commission');

module.exports = function(app) {
  // Add commission rate
  app.post('/addCommisionRate', (req, res) => {
  	if (req.body.percentage && req.body.blankType) {
  		let newCommission = new Commission({
  			percentage: req.body.percentage,
  			blankType: req.body.blankType
  		});

  		newCommission.save();
  		console.log("Added New Commission!");
  		res.send("Added new Commission!");
  	}
  });

  // Edit commission rate
  app.post('/editCommissionRate', (req, res) => {
		Commission.findOneAndUpdate({ blankType: req.body.blankType }, { percentage: req.body.percentage }, function(err, result) {
			if (err) throw err;
			res.send(result);
			console.log("Updated Commission Rate!");
		});
  });
}
