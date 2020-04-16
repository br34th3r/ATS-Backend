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
  		res.status(200).json({ ok: true });
  	} else {
      res.status(400).json({ errors: "Invalid Query!" });
    }
  });

  // Edit commission rate
  app.post('/editCommissionRate', (req, res) => {
    if (req.body.blankType && req.body.percentage) {
      Commission.findOneAndUpdate({ blankType: req.body.blankType }, { percentage: req.body.percentage }, function(err, result) {
  			if (err) throw err;
  			res.status(200).json({ ok: true });
  			console.log("Updated Commission Rate!");
  		});
    } else {
      res.status(400).json({ errors: "Invalid Query!" });
    }
  });
}
