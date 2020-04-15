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
  		res.send("Blank(s) Added!");
  		console.log("Added Blank(s)!");
  	} else {
      res.send("Invalid Query!");
    }
  });

  // Remove a Blank
  app.delete('/removeBlank/:blankID', (req, res) => {
  	Blank.findOne({ _id: req.params.blankID }, (err, doc) => {
  		if (err) throw err;
  		if (doc != null) {
  			if (doc.AgentID == null) {
  				Blank.findByIdAndRemove({_id: doc._id}, (err, offer) => {
  					if (err) throw err;
  					console.log("Blank Removed!");
  					res.send("Blank Removed!");
  				});
  			} else {
  				res.send("Failure, Blank is Assigned!");
  			}
  		}
  	});
  });

  // Bulk Remove Blanks
  app.delete('/removeBlanks/:start/:end', (req, res) => {
  	for (var i = parseInt(req.params.start); i <= parseInt(req.params.end); i++) {
  		Blank.findOne({ number: i.toString().padStart(8, "0") }, (err, blank) => {
  			if (err) throw err;
  			if (blank != null) {
  				if (blank.AgentID == null) {
  					Blank.findByIdAndRemove({_id: blank._id}, (err, offer) => {
  						if (err) throw err;
  					});
  				}
  			}
  		});
  	}
  	console.log("Removal Terminated!");
  	res.send("Removal Terminated!");
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
