module.exports = function(app, passport) {
  // Handle User Login
  app.post('/login', passport.authenticate('local', {
  	successRedirect: '/success',
  	failureRedirect: '/failed'
  }));

  app.get('/success', (req, res) => {
  	console.log("Successful Login!");
  	res.send("Success!");
  });

  app.get('/failed', (req, res) => {
  	console.log("Failed Login!");
  	res.send("Failure!");
  })

  app.get('/logout', (req, res) => {
  	req.logout();
  	res.send("Logged Out");
  });
}
