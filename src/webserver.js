/**
 * webserver.js, to serve all your web needs
 */

import passport from 'passport';
import { Strategy as OmegaStrategy } from 'passport-omega';
import exphbs from 'express-handlebars';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

export default (controller) => {

  // setup passport for Omega authentication
  passport.use(new OmegaStrategy({
    clientID: process.env.OMEGA_APP_ID,
    clientSecret: process.env.OMEGA_APP_SECRET,
    callbackURL: process.env.OMEGA_CALLBACK,
  }, (accessToken, refreshToken, profile, done) => {
    done(null, profile);
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  // setup the webserver
  controller.setupWebserver(process.env.WEBSERVER_PORT, (err, app) => {
    app.use(cookieParser())
    app.use(session({ secret: 'lanbotx' }));
    app.use(bodyParser.json())
    app.use(passport.initialize());
    app.use(passport.session());
    app.engine('handlebars', exphbs());
    app.set('view engine', 'handlebars');

    // Index
    app.get('/', (req, res) => {
      if (req.isAuthenticated()) {
        res.redirect('/dashboard');
        return;
      }

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
      if (!req.isAuthenticated()) {
        res.redirect('/');
        return;
      }

      controller.storage.responses.all((err, responses) => {
        responses = responses.filter((r) => r.reply !== '__DELETED__');
        res.render('dashboard', { responses: responses });
      }, {
        type: 'array'
      });
    });

    // Add a new response
    app.post('/dashboard', (req, res) => {
      if (!req.isAuthenticated()) {
        res.redirect('/');
        return;
      }

      controller.storage.responses.save({
        id: new Date().getUTCMilliseconds(),
        reply: req.body.reply,
        regex: req.body.regex,
      });

      res.redirect('/dashboard');
    });

    // Delete a response
    app.get('/delete/:id', (req, res) => {
      controller.storage.responses.save({
        id: req.params['id'],
        reply: '__DELETED__',
        regex: '__DELETED__',
      });

      res.redirect('/dashboard');
    });
  });
}
