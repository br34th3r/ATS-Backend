const Blank = require('../schemas/Blank'); // a variable is created that loads a module that exists in a separate file into the variable.

module.exports = function(app) {
  // Assign/Reassign a Blank
  app.patch('/blanks/assign/:start/:end/:agentID', (req, res) => {
  	for (var i = parseInt(req.params.end); i >= parseInt(req.params.start); i--) {
  		Blank.findOne({ number: i.toString().padStart(8, "0") }, (err, doc) => {
        if (err) { res.status(400).json({ errors: err }); }
        if (doc != null) {
          doc.AgentID = (req.params.agentID != "NULL") ? req.params.agentID : null;
          doc.save();
        }
      });
  	}
  	res.status(200).json({ ok: true });
  	console.log("Assigned Blank(s) to Agent!")
  });

  // Get Blanks assigned to the travel agent
  app.get('/blanks/getAssigned/:agentID', (req, res) => {
  	Blank.find({ AgentID: req.params.agentID }, (err, docs) => {
  		if (err) { res.status(400).json({ errors: err }); }
  		else {
        res.json(docs);
  		  console.log("Sent Agent Blanks!");
      }
  	});
  });
}
