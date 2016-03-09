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
import redis from 'botkit/lib/storage/redis_storage';
import fs from 'fs';
import Path from 'path';
import monitor from './src/monitor';

/**
 * Initialize botkit
 */
const storage = redis({
  host: process.env.REDIS_PORT_6379_TCP_ADDR || '127.0.0.1',
  port: process.env.REDIS_PORT_6379_TCP_PORT || 6379,
  namespace: 'lanbot',
  methods: ['teams', 'users', 'channels', 'responses', 'karma'],
});

const controller = Botkit.slackbot({
  debug: false,
  storage: storage,
});

const worker = controller.spawn({
  token: process.env.token
}).startRTM((err) => {
  if (err) {
    throw new Error(err);
  }
});

monitor(controller, worker);

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
for(const file of fs.readdirSync('./scripts/')) {
  if (Path.extname(file) !== '.js') {
    continue;
  }

  try {
    const script = require(`./scripts/${file}`).default;
    new script(controller);
  } catch (e) {
    console.error(`Unable to load ${file}: ${e.stack}`);
  }
}
