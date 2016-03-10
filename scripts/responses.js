/**
 * responses.js, a slackbot-like response manager
 *
 * SETUP:
 *   requires redis with custom storage method "responses"
 *
 * USAGE:
 *   <trigger> // response
 */

export default (controller) => {
  controller.storage.responses.all(
    (err, responses) => initResponses(err, responses),
    { type: 'array' }
  );

  // Setup listeners for all responses
  const initResponses = (err, responses) => {
    for (const response in responses) {
      this.controller.hears(
        response.regex,
        ['ambient'],
        (bot, message) => {
          bot.reply(message, response.reply);
        }
      );
    }
  };
}
