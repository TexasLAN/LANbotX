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

export default (controller) => {
  const cache = {};

  // ++
  controller.hears(
    "^([\\s\\w'@.\\-:]*)\\s*(\\+\\+)(?:\\s+(?:for|because|cause|cuz|as)\\s+(.+))?$",
    ['ambient'],
    (bot, message) => changeKarma(bot, message, true)
  );

  // --
  controller.hears(
    "^([\\s\\w'@.\\-:]*)\\s*(--|—)(?:\\s+(?:for|because|cause|cuz|as)\\s+(.+))?$",
    ['ambient'],
    (bot, message) => changeKarma(bot, message, false)
  );

  // score
  controller.hears(
    "score (for\\s)?(.*)",
    ['direct_mention', 'direct_message'],
    (bot, message) => printScore(bot, message)
  );

  const changeKarma = (bot, message, increment) => {
    let name = cleanName(message.match[1]);
    const reason = message.match[5];

    // No name, use last item used
    if (!name) {
      name = cache[message.channel];
    }

    controller.storage.karma.get(name, (err, item) => {
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
      controller.storage.karma.save(item);

      // Cache for ++ and -- with no name
      cache[message.channel] = name;

      // Send the message
      bot.reply(message, `${name} has ${item.score} points`);
    });
  };

  const printScore = (bot, message) => {
    const name = cleanName(message.match[2]);
    controller.storage.karma.get(name, (err, item) => {
      if (!item) {
        bot.reply(message, `${name} has 0 points`);
        return;
      }

      if (item.reasons.length > 0) {
        bot.reply(message, `${name} has ${item.score} points`);
      } else {
        bot.reply(message, `${name} has ${item.score} points`);
      }
    });
  };

  const cleanName = (name) => {
    if (name.charAt(0) === ':') {
      return name.replace(/(^\s*@)|([,\s]*$)/g, '').trim().toLowerCase();
    } else {
      return name.replace(/(^\s*@)|([,:\s]*$)/g, '').trim().toLowerCase();
    }
  };
}
