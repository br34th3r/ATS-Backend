const spawn = require('child_process').spawn;

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
}
