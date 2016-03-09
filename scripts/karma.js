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
    /^([\s\w'@.\-:]*)\s*(\+\+)(?:\s+(?:for|because|cause|cuz|as)\s+(.+))?$/i,
    ['ambient'],
    (bot, message) => changeKarma(bot, message, true)
  );

  // --
  controller.hears(
    /^([\s\w'@.\-:]*)\s*(--|—)(?:\s+(?:for|because|cause|cuz|as)\s+(.+))?$/i,
    ['ambient'],
    (bot, message) => changeKarma(bot, message, false)
  );

  // score
  controller.hears(
    /score (for\s)?(.*)/i,
    ['direct_mention', 'direct_message'],
    (bot, message) => printScore(bot, message)
  );

  // top or bottom [n]
  controller.hears(
    /(top|bottom) (\d+)/i,
    ['direct_mention', 'direct_message'],
    (bot, message) => top(bot, message)
  );

  const changeKarma = (bot, message, increment) => {
    let name = cleanName(message.match[1]);
    let reason = message.match[3];

    // Make sure we can do something valid
    if (!name && !cache[message.channel]) {
      return;
    }

    // Get name / reason from cache
    if (!name && !reason) {
      name = cache[message.channel].name;
      reason = cache[message.channel].reason;
    } else if (!name && reason) {
      name = cache[message.channel].name;
    }

    if (reason) {
      reason = reason.trim();
    }

    controller.storage.karma.get(name, (err, item) => {
      // We're creating a new item
      if (!item) {
        item = {
          id: name,
          score: 0,
          reasons: {},
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
        // Save the reason if we haven't seen it before
        if (!item.reasons[reason]) {
          item.reasons[reason] = 0;
        }

        // Update the reason's score
        if (increment) {
          item.reasons[reason]++;
        } else {
          item.reasons[reason]--;
        }
      }

      // Save
      controller.storage.karma.save(item);

      // Cache for ++ and -- with no name
      cache[message.channel] = { name, reason };

      const points = item.score === 1 ? 'point' : 'points';

      // Send the message
      if (!reason) {
        bot.reply(message, `${name} has ${item.score} ${points}`);
      } else {
        const are = item.reasons[reason] === 1 ? 'is' : 'are';
        bot.reply(
          message,
          `${name} has ${item.score} points, ${item.reasons[reason]} of which ${are} for ${reason}`
        );
      }
    });
  };

  const printScore = (bot, message) => {
    const name = cleanName(message.match[2]);
    controller.storage.karma.get(name, (err, item) => {
      if (!item) {
        bot.reply(message, `${name} has 0 points`);
        return;
      }

      const points = item.score === 1 ? 'point' : 'points';

      if (item.reasons.length > 0) {
        bot.reply(message, `${name} has ${item.score} ${points}`);
      } else {
        bot.reply(message, `${name} has ${item.score} ${points}`);
      }
    });
  };

  const top = (bot, message) => {
    const reverse = message.match[1] === 'bottom';
    const amount = message.match[2];
    controller.storage.karma.all((err, items) => {
      // Sort all the scores
      let sorted = items.sort((a, b) => {
        return b.score - a.score;
      });

      // Reverse if want the bottom [n]
      if (reverse) {
        sorted = sorted.reverse();
      }

      // Get the [n] we care about
      sorted = sorted.slice(0, amount);

      if (sorted.length > 0) {
        let reply = "";
        for (let i = 0; i < sorted.length; i++) {
          reply += `${i + 1}. ${sorted[i].id} : ${sorted[i].score}\n`;
        }
        bot.reply(message, reply);
      } else {
        bot.reply(message, "No scores to keep track of yet!");
      }
    }, { type: 'array' });
  };

  const cleanName = (name) => {
    if (name.charAt(0) === ':') {
      return name.replace(/(^\s*@)|([,\s]*$)/g, '').trim().toLowerCase();
    } else {
      return name.replace(/(^\s*@)|([,:\s]*$)/g, '').trim().toLowerCase();
    }
  };
}
