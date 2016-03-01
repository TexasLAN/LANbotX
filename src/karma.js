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
    this.printScore = this.printScore.bind(this);

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

    controller.hears(
      "score (for\\s)?(.*)",
      ['direct_mention', 'direct_message'],
      this.printScore
    );
  }

  changeKarma(bot, message, increment) {
    let name = message.match[1].trim().toLowerCase();
    const reason = message.match[5];

    // No name, use last item used
    if (!name) {
      name = this.cache[message.channel];
    }

    this.controller.storage.karma.get(name, (err, item) => {
      if (!item) {
        item = {
          id: name,
          score: 0,
          reasons: [],
        };
      }

      // Update score
      if (increment) {
        item.score++;
      } else {
        item.score--;
      }

      // Update reason
      if (reason) {
        item.reasons.push(reason);
      }

      // Save
      this.controller.storage.karma.save(item);

      // Cache for ++ and -- with no name
      this.cache[message.channel] = name;

      // Send the message
      bot.reply(message, `${name} has ${item.score} points`);
    });
  }

  printScore(bot, message) {
    let name = message.match[2].trim().toLowerCase();
    this.controller.storage.karma.get(name, (err, item) => {
      if (name.charAt(0) === ':') {
        name = name.replace(/(^\s*@)|([,\s]*$)/g, '')
      } else {
        name = name.replace(/(^\s*@)|([,:\s]*$)/g, '')
      }

      if (item.reasons.length > 0) {
        bot.reply(message, `${name} has ${item.score} points`);
      } else {
        bot.reply(message, `${name} has ${item.score} points`);
      }
    });
  }
}
