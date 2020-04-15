const Blank = require('../schemas/Blank');

module.exports = function(app) {
  // Get all the blanks
  app.get('/blanks', (req, res) => {
  	Blank.find({}, (err, docs) => {
  		if (err) { res.send(err); }
  		res.send(docs);
  		console.log("Blanks Returned!");
  	});
  });

  // Add a Blank
  app.post('/addBlanks', (req, res) => {
  	if (req.body.blankType && req.body.start && req.body.end) {
  		for (var i = parseInt(req.body.end); i >= req.body.start; i--) {
  			let newBlank = new Blank({
  				type: req.body.blankType,
  			  isValid: true,
  			  AgentID: null,
  				number: i.toString().padStart(8, "0")
  			});

  			newBlank.save();
  		}
  		res.status(200).json({ ok: true });
  		console.log("Added Blank(s)!");
  	} else {
      res.send("Invalid Query!");
    }
  });

  // Bulk Remove Blanks
  app.delete('/removeBlanks', (req, res) => {
	  if (req.body.start && req.body.end) {
			Blank.deleteMany({ AgentID: null, number: { $lte: req.body.end, $gte: req.body.start } }, (err, blanks) => {
				if (err) res.status(400).json({ errors: err });
				res.status(200).json({ ok: true, deleted: blanks.length })
			});
    } else {
      res.status(400).json({ errors: "Invalid Query!" });
    }
  });

  // Get blanks by a type
  app.get('/blanks/type/:type', (req, res) => {
  	Blank.find({ type: req.params.type }, (err, docs) => {
  		if (err) throw err;
  		res.json(docs);
  		console.log("Sent Blanks of Type");
  	});
  });

  // Get a Blank by ID
  app.get('/blanks/id/:blankID', (req, res) => {
  	Blank.findById(req.params.blankID, (err, doc) => {
  		if (err) throw err;
  		res.json(doc);
  		console.log("Found Blank by ID");
  	});
  });

  // Get a Blank by Number
  app.get('/blanks/number/:number', (req, res) => {
  	Blank.find({ number: req.params.number.toString().padStart(8, "0") }, (err, doc) => {
  		if (err) throw err;
  		res.json(doc);
  		console.log("Retrieved Blank by Number");
  	});
  });
}
