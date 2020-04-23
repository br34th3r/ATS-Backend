const Blank = require('../schemas/Blank'); // a variable is created that loads a module that exists in a separate file into the variable.

module.exports = function(app) {
  // Assign/Reassign a Blank
  app.post('/blanks/assign', (req, res) => {
    if(req.body.blankType && req.body.agentID && req.body.blankNumber) {
      Blank.updateMany({ type: req.body.blankType, number: req.body.blankNumber }, { AgentID: req.body.agentID }, (err, doc) => {
        if (err) { res.status(400).json({ errors: err }); }
        res.status(200).json({ ok: true });
      });
    } else {
      res.status(400).json({ errors: "Invalid Query!" });
    }
  })

  // Get Blanks assigned to the travel agent
  app.get('/blanks/getAssigned', (req, res) => {
    if (req.body.agentID) {
    	Blank.find({ AgentID: req.body.agentID }, (err, docs) => {
    		if (err) { res.status(400).json({ errors: err }); }
    		else {
          res.status(200).json({ ok: true, blanks: docs });
    		  console.log("Sent Agent Blanks!");
        }
    	});
    } else {
      res.status(400).json({ errors: "Invalid Query!" });
    }
  });
}
