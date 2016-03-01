/**
 * responses.js, a slackbot-like response manager
 *
 * SETUP:
 *   requires redis with custom storage method "responses"
 *   env variables:
 *     OMEGA_APP_ID     // the Omega app ID
 *     OMEGA_APP_SECRET // the Omega app secret key
 *     OMEGA_CALLBACK   // the callback URL for the Omega app
 *     PORT             // port to run express on
 *
 * USAGE:
 *   <trigger> // response
 *   To setup trigger / response pairs, visit the express endpoint
 */

import passport from 'passport';
import { Strategy as OmegaStrategy } from 'passport-omega';

export default class Responses {
  constructor(controller) {
    this.loadResponses = this.loadResponses.bind(this);
    this.setupServer = this.setupServer.bind(this);
    this.initResponses = this.initResponses.bind(this);

    // Setup
    this.controller = controller;
    this.responses = [];
    this.loadResponses();
    this.setupServer();
  }

  setupServer() {
    // setup passport for authentication via Omega
    passport.use(new OmegaStrategy({
      clientID: process.env.OMEGA_APP_ID,
      clientSecret: process.env.OMEGA_APP_SECRET,
      callbackURL: process.env.OMEGA_CALLBACK,
    }, (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }));

    // setup the webserver
    this.controller.setupWebserver(process.env.PORT, (err, app) => {
      app.set('view engine', 'jade');

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
        res.render('dashboard', { responses: this.responses });
      });
    });
  }

  // Get the responses from redis
  loadResponses() {
    this.controller.storage.responses.all(
      this.initResponses,
      { type: 'array' }
    );
  }

  // Setup listeners for all responses
  initResponses(err, responses) {
    this.responses = responses;
    for (const response in responses) {
      this.controller.hears(
        response.regex,
        ['ambient'],
        (bot, message) => {
          bot.reply(message, response.reply);
        }
      );
    }
  }
}
