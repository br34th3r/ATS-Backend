const spawn = require('child_process').spawn;
const ExchangeRate = require('../schemas/ExchangeRate');

module.exports = function(app) {
  // Backup the Database
  app.get('/database/backup', (req, res) => {
  	var datetime = Date.now();
  	var args = ['--db', 'ats-db', '--out', datetime ]
        , mongodump = spawn('/usr/local/bin/mongodump', args);
    mongodump.stdout.on('data', function (data) {
  		console.log("Backed Up!");
    });
    mongodump.stderr.on('data', function (data) {
      console.log(data.toString());
    });
    mongodump.on('exit', function (code) {
      console.log('Finished');
    });
  	res.send("Finished Backing Up!");
  });

  // Restore Database from Backup
  app.get('/database/restore/:backup', (req, res) => {
  	var args = [ "--drop", req.params.backup + "/" ]
        , mongodump = spawn('/usr/local/bin/mongorestore', args);
    mongodump.stdout.on('data', function (data) {
  		console.log("Restored!");
    });
    mongodump.stderr.on('data', function (data) {
      console.log(data.toString());
    });
    mongodump.on('exit', function (code) {
      console.log('Finished');
    });
  	res.send("Finished Restoring!");
  });

  // Add an Exchange Rate
  app.post('/addExchangeRate', (req, res) => {
    if(req.query.currencyCode && req.query.rate) {
      let newRate = new ExchangeRate({
        currencyCode: req.query.currencyCode,
        rate: req.query.rate,
        dateAdded: Date.now()
      });

      newRate.save();
      res.send("Added New Exchange Rate!");
      console.log("Added New Exchange Rate!")
    } else {
      res.send("Invalid Query!");
    }
  });
}
