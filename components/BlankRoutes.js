const Blank = require('../schemas/Blank');
const Ticket = require('../schemas/Ticket');

module.exports = function(app) {
  // Get all the blanks
  app.get('/blanks', (req, res) => {
  	Blank.find({}, (err, docs) => {
  		if (err) { res.status(400).json({ errors: err }); }
  		res.status(200).json({ ok:true, blanks: docs });
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
      res.status(400).json({ errors: "Invalid Query!" });
    }
  });

  // Bulk Remove Blanks
  app.delete('/removeBlanks', (req, res) => {
	  if (req.body.start && req.body.end && req.body.blankType) {
			Blank.deleteMany({ type: req.body.blankType,
                          AgentID: null,
                          number: { $lte: req.body.end, $gt: req.body.start - 1 }
                        }, (err, status) => {
        if (err) { res.status(400).json({ errors: err }) };
				res.status(200).json({ ok: true });
			});
    } else {
      res.status(400).json({ errors: "Invalid Query!" });
    }
  });

  // Find a Blank by Type and Number
  app.post('/blanks/find', (req, res) => {
    if(req.body.blankNumber && req.body.blankType) {
      console.log(req.body.blankNumber.toString().padStart(8, "0"));
      Blank.findOne({ type: req.body.blankType, number: req.body.blankNumber.toString().padStart(8, "0") }, (err, doc) => {
    		if (err) { res.status(400).json({ errors: err }); return null; }
        if (!doc) { res.status(400).json({ errors: "Blank not Found!" }); return null; }
        Ticket.findOne({ blankID: doc._id }, (err, ticket) => {
          if (err) { res.status(400).json({ errors: err }); return null; }
          if (!ticket) { res.status(400).json({ errors: "No Ticket Matching this Blank" }); return null; }
          res.status(200).json({ ok: true, ticket: ticket });
        });
    	});
    } else {
      res.status(400).json({ errors: "Invalid Query!" });
    }
  });
}
