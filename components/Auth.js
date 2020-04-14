module.exports = function(app, passport) {
  // Handle User Login
  app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return res.status(400).json({ errors: err });
      if (!user) return res.status(400).json({ errors: "No User Found!" });
      req.logIn(user, (err) => {
        if (err) return res.status(400).json({ errors: err });
        return res.status(200).json(user);
      })
    })(req, res, next);
  });

  app.get('/logout', (req, res) => {
  	req.logout();
  	res.send("Logged Out");
  });
}
