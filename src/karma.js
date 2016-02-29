/**
 * Karma.js, a plus-plus clone for botkit
 *
 * SETUP:
 *   import Karma from './karma';
 *   new Karma(controller);
 *
 * USAGE:
 *   <item>++ // increment score for item
 *   <item>-- // decrement score for item
 */

export default class Karma {
  constructor(controller) {
    this.cache = {};

    // ++
    controller.hears(
      "^([\\s\\w'@.\\-:]*)\\s*(\\+\\+)(?:\\s+(?:for|because|cause|cuz|as)\\s+(.+))?$",
      ['ambient'],
      this.plus.bind(this)
    );

    // --
    controller.hears(
      "^([\\s\\w'@.\\-:]*)\\s*(--|—)(?:\\s+(?:for|because|cause|cuz|as)\\s+(.+))?$",
      ['ambient'],
      this.minus.bind(this)
    );
  }

  plus(bot, message) {
    const name = message.match[1];
    const reason = message.match[3];
    this.cache[name] = {
      score: this.cache[name] ? this.cache[name].score + 1 : 1,
      reason: this.reason,
    };

    bot.reply(message, `${name} has ${this.cache[name].score} points`);
  }

  minus(bot, message) {
    const name = message.match[1];
    const reason = message.match[3];
    this.cache[name] = {
      score: this.cache[name] ? this.cache[name].score - 1 : -1,
      reason: this.reason,
    };

    bot.reply(message, `${name} has ${this.cache[name].score} points`);
  }
}
