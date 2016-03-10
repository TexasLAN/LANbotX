/**
 * webserver.js, to serve all your web needs
 */

import passport from 'passport';
import { Strategy as OmegaStrategy } from 'passport-omega';
import exphbs from 'express-handlebars';

export default (controller) => {

  // setup passport for Omega authentication
  passport.use(new OmegaStrategy({
    clientID: process.env.OMEGA_APP_ID,
    clientSecret: process.env.OMEGA_APP_SECRET,
    callbackURL: process.env.OMEGA_CALLBACK,
  }, (accessToken, refreshToken, profile, done) => {
    done(null, profile);
  }));

  // setup the webserver
  controller.setupWebserver(process.env.WEBSERVER_PORT, (err, app) => {
    app.engine('handlebars', exphbs());
    app.set('view engine', 'handlebars');

    app.get('/', (req, res) => {
      res.render('index');
    });

    // Omega Login
    app.get('/auth/omega', passport.authenticate('omega'));

    app.get(
      '/auth/omega/callback',
      passport.authenticate('omega', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
      })
    );

    // Responses dashboard
    app.get('/dashboard', (req, res) => {
      res.render('dashboard', { responses: responses });
    });
  });
}
