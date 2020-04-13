const Commission = require('../schemas/Commission');

module.exports = function(app) {
  // Add commission rate
  app.post('/addCommisionRate', (req, res) => {
  	if (req.query.percentage && req.query.blankType) {
  		let newCommission = new Commission({
  			percentage: req.query.percentage,
  			blankType: req.query.blankType
  		});

  		newCommission.save();
  		console.log("Added New Commission!");
  		res.send("Added new Commission!");
  	}
  });

  // Edit commission rate
  app.post('/editCommissionRate', (req, res) => {
		Commission.findOneAndUpdate({ blankType: req.query.blankType }, { percentage: req.query.percentage }, function(err, result) {
			if (err) throw err;
			res.send(result);
			console.log("Updated Commission Rate!");
		});
  });
}
