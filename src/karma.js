/**
 * Karma.js, a plus-plus clone for botkit
 *
 * SETUP:
 *   requires redis with custom storage method "karma"
 *
 * USAGE:
 *   <item>++ // increment score for item
 *   <item>-- // decrement score for item
 */

export default class Karma {
  constructor(controller) {
    this.changeKarma = this.changeKarma.bind(this);

    // caches
    this.controller = controller;
    this.cache = {};

    // ++
    controller.hears(
      "^([\\s\\w'@.\\-:]*)\\s*(\\+\\+)(?:\\s+(?:for|because|cause|cuz|as)\\s+(.+))?$",
      ['ambient'],
      (bot, message) => this.changeKarma(bot, message, true)
    );

    // --
    controller.hears(
      "^([\\s\\w'@.\\-:]*)\\s*(--|—)(?:\\s+(?:for|because|cause|cuz|as)\\s+(.+))?$",
      ['ambient'],
      (bot, message) => this.changeKarma(bot, message, false)
    );
  }

  changeKarma(bot, message, increment) {
    let name = message.match[1];
    const reason = message.match[5];

    // No name, use last item used
    if (!name) {
      name = this.cache[message.channel];
    }

    this.controller.storage.karma.get(name, (err, item) => {
      if (!item) {
        item = { id: name };
      }

      // Set the karma if it doesn't exist
      if (!item.karma) {
        item.karma = { score: 0, reasons: [] };
      }

      // Update score
      if (increment) {
        item.karma.score++;
      } else {
        item.karma.score--;
      }

      // Update reason
      if (reason) {
        item.karma.reasons.push(reason);
      }

      // Save
      this.controller.storage.karma.save(item);

      // Cache for ++ and -- with no name
      this.cache[message.channel] = name;

      // Send the message
      bot.reply(message, `${name} has ${item.karma.score} points`);
    });
  }
}
