module.exports = function(app, passport) {
  // Handle User Login
  app.post('/login', passport.authenticate('local'), (req, res, next) => {
    res.status(200).json({ ok: true, user: req.session.passport.user });
    next();
  });

  app.get('/logout', (req, res) => {
  	req.logout();
  	res.status(200).json({ ok: true });
  });
}
