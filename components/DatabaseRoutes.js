const spawn = require('child_process').spawn;
const ExchangeRate = require('../schemas/ExchangeRate');

module.exports = function(app) {
  // Backup the Database
  app.get('/database/backup', (req, res) => {
  	var datetime = Date.now();
  	var args = ['--db', 'ats-db', '--out', `${__dirname}/../backups/${datetime}` ]
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
  	res.status(200).json({ ok: true, backup: datetime });
  });

  // Restore Database from Backup
  app.post('/database/restore', (req, res) => {
    if(req.body.backup) {
    	var args = [ "--drop", `${__dirname}/../backups/${req.body.backup}/` ]
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
    	res.status(200).json({ ok: true });
    } else {
      res.status(400).json({ errors: "Invalid Query! "});
    }
  });

  // Add an Exchange Rate
  app.post('/addExchangeRate', (req, res) => {
    if(req.body.currencyCode && req.body.rate) {
      let newRate = new ExchangeRate({
        currencyCode: req.body.currencyCode,
        rate: req.body.rate,
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
