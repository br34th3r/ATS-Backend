const Blank = require('../schemas/Blank');

module.exports = function(app) {
  // Assign/Reassign a Blank
  app.patch('/blanks/assign/:start/:end/:agentID', (req, res) => {
  	for (var i = parseInt(req.params.end); i >= parseInt(req.params.start); i--) {
  		Blank.findOne({ number: i.toString().padStart(8, "0") }, (err, doc) => {
        if (err) throw err;
        if (doc != null) {
          doc.AgentID = (req.params.agentID != "NULL") ? req.params.agentID : null;
          doc.save();
        }
      });
  	}
  	res.send("Assigned Blank(s) to Agent!");
  	console.log("Assigned Blank(s) to Agent!")
  });

  // Get Blanks assigned to the travel agent
  app.get('/:agentID/blanks', (req, res) => {
  	Blank.find({ AgentID: req.params.agentID }, (err, docs) => {
  		if (err) throw err;
  		res.json(docs);
  		console.log("Sent Agent Blanks!");
  	});
  });
}
