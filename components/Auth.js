module.exports = function(app, passport) {
  // Handle User Login
  app.post('/login', (req, res, next) => {
    // generate the authenticate method and pass the req/res
    passport.authenticate('local', function(err, user, info) {
      if (err) { res.status(400).json({ errors: err }); return next(err); }
      if (!user) { res.status(400).json({ errors: "No User Found!" }); return next(); }

      // req / res held in closure
      req.logIn(user, function(err) {
        if (err) { res.status(400).json({ errors: err }); return next(err); }
        return res.status(200).json({ ok: true, session: user });
      });

    })(req, res, next);
  });

  app.get('/logout', (req, res) => {
  	req.logout();
  	res.status(200).json({ ok: true });
  });
}
