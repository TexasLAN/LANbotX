/**
 *
 *  __         ______     __   __     ______     ______     ______
 * /\ \       /\  __ \   /\ "-.\ \   /\  == \   /\  __ \   /\__  _\
 * \ \ \____  \ \  __ \  \ \ \-.  \  \ \  __<   \ \ \/\ \  \/_/\ \/
 *  \ \_____\  \ \_\ \_\  \ \_\\"\_\  \ \_____\  \ \_____\    \ \_\
 *   \/_____/   \/_/\/_/   \/_/ \/_/   \/_____/   \/_____/     \/_/
 *
 *
 *                 LANBotX, a botkit-powered LANBot
 */

import Botkit from 'botkit';

/**
 * Initialize botkit
 */
const controller = Botkit.slackbot({
  debug: false,
});

controller.spawn({
  token: process.env.token
}).startRTM((err) => {
  if (err) {
    throw new Error(err);
  }
});

/**
 * Determine if bot is running
 */
controller.hears(
  'ping',
  ['direct_message','direct_mention','mention'],
  (bot,message) => {
    bot.reply(message, 'PONG');
  }
);

/**
 * Initalize scripts
 */
import Karma from './src/karma';
new Karma(controller);
