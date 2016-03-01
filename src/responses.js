/**
 * responses.js, a slackbot-like response manager
 *
 * SETUP:
 *   requires redis with custom storage method "responses"
 *   env variables:
 *     EXPRESS_PORT // port to run express on
 *
 * USAGE:
 *   <trigger> // response
 *   To setup trigger / response pairs, visit the express endpoint
 */

import express from 'express';

const app = express();

export default class Responses {
  constructor(controller) {
    // This binding *sigh*
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
    app.set('view engine', 'jade');

    app.get('/', function (req, res) {
      res.send('GET request to the homepage');
    });

    app.listen(process.env.EXPRESS_PORT, function () {
      console.log('Example app listening on port 3000!');
    });
  }

  // Get the responses from redis
  loadResponses() {
    this.controller.storage.responses.all(this.initResponses, { type: 'array' });
  }

  // Setup listeners for all responses
  initResponses(err, responses) {
    for (const response in this.responses) {
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
