/**
 * Monitor, a governor for the bot kit worker and controller
 */

export default (controller, worker) => {
  // Banned replies from lanbot
  const banned = ['@channel', '@here', '@group'];

  // Make sure lanbot doesn't say something we don't want it to
  const reply = worker.reply;
  worker.reply = (src, resp, cb) => {
    // Never say a banned word
    for (const word of banned) {
      if (resp.toLowerCase().indexOf(word) !== -1) {
        return;
      }
    }

    // Defer to built-in reply
    reply(src, resp, cb);
  };

  // I thought the method built-in to botkit that did this was dumb so I re-wrote it
  controller.hears = (keywords, events, cb) => {
    if (!Array.isArray(keywords)) {
      keywords = [keywords];
    }

    if (!Array.isArray(events)) {
      events = events.split(/\,/g);
    }

    // Register all of the keywords on the events
    for(const keyword of keywords) {
      for (const event of events) {
        controller.on(event, (bot, message) => {
          if (message.text) {
            let match;
            if (match = message.text.match(keyword)) {
              // We have a match
              controller.debug('I HEARD', keyword);
              message.match = match;

              // Verify messages aren't being sent too quickly
              if (isSpam(message)) {
                return;
              }

              // We want the username, so set it
              getUsername(message.user, (user_name) => {
                message.user_name = user_name;

                // Do the provided callback
                cb.apply(controller, [bot, message]);
              })

              return false;
            }
          }
        });
      }
    }

    return this;
  };

  // "Spam" is considered more than one action a minute. This checks that condition
  const spam_cache = {};
  const isSpam = (message) => {
    if (!spam_cache[message.user]) {
      // User was not in the spam cache; they're good
      spam_cache[message.user] = new Date();
      return false;
    }

    // See if the user has sent something in the last minute
    const date = spam_cache[message.user];
    if (date.setMinutes(date.getMinutes() + 1) > new Date()) {
      return true;
    }

    // Reset the user's timer
    spam_cache[message.user] = new Date();
    return false;
  };

  // We typically care about the username, not the id; this fixes that mapping
  const username_cache = {};
  const getUsername = (user_id, cb) => {
    if (username_cache[user_id]) {
      // It's inside the cache; return that
      cb(username_cache[user_id]);
      return;
    }

    // Get the username from the API
    worker.api.users.info({user: user_id}, (err, {user}) => {
      username_cache[user_id] = user.name;
      cb(user.name);
    });
  };
}
