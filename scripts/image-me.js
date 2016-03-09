/**
 * image-me.js, a hubot-google-images clone for botkit
 *
 * SETUP:
 *   env variables:
 *     HUBOT_GOOGLE_CSE_ID  // custom search engine ID
 *     HUBOT_GOOGLE_CSE_KEY // custom search enging private key
 *
 * USAGE:
 *   @<botname> image me <query>
 *   @<botname> animate me <query>
 */

import request from 'request';

export default (controller) => {
  const googleCseId = process.env.HUBOT_GOOGLE_CSE_ID;
  const googleApiKey = process.env.HUBOT_GOOGLE_CSE_KEY;
  const url = 'https://www.googleapis.com/customsearch/v1';

  // image me
  controller.hears(
    /(image|img)( me)? (.+)/i,
    ['direct_message', 'direct_mention'],
    (bot, message) => imageMe(bot, message)
  );

  // animate me
  controller.hears(
    /animate( me)? (.+)/i,
    ['direct_message', 'direct_mention'],
    (bot, message) => animateMe(bot, message)
  );

  const imageMe = (bot, message) => {
    const search = message.match[3];
    const query = {
      q: search,
      searchType: 'image',
      safe: 'high',
      fields: 'items(link)',
      cx: googleCseId,
      key: googleApiKey,
    };
    doRequest(bot, message, query);
  };

  const animateMe = (bot, message) => {
    const search = message.match[2];
    const query = {
      q: search,
      searchType: 'image',
      safe: 'high',
      fields: 'items(link)',
      cx: googleCseId,
      key: googleApiKey,
      fileType: 'gif',
      hq: 'animated',
      tbs: 'itp:animated',
    };
    doRequest(bot, message, query, true);
  };

  // Perform the actual request to google to get an image
  const doRequest = (bot, message, query, animated) => {
    request.get({ url: url, qs: query }, (err, res, body) => {
      const response = JSON.parse(body);
      let image = response.items[Math.floor(Math.random() * response.items.length)];
      image = ensureResult(image.link, animated);

      bot.reply(message, image);
    });
  };

  // Force giphy to use animated version
  const ensureResult = (url, animated) => {
    if (animated === true) {
      return ensureImageExtension(
        url.replace(
          /(giphy\.com\/.*)\/.+_s.gif$/,
          '$1/giphy.gif'
        )
      );
    } else {
      return ensureImageExtension(url);
    }
  };

  // For the URL to look like an image
  const ensureImageExtension = (url) => {
    if (/(png|jpe?g|gif)$/i.test(url)) {
      return url;
    } else {
      return url + "#.png";
    }
  };
}
