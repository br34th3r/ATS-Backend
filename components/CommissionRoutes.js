const Commission = require('../schemas/Commission');

module.exports = function(app) {
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
  app.post('/editCommissionRate', (req, res) => {
		Commission.findOneAndUpdate({ blankType: req.query.blankType }, { amount: req.query.amount }, function(err, result) {
			if (err) {
				res.send(err);
			} else {
				res.send(result);
				console.log("Updated Commission Rate!");
			}
		});
  });
}
