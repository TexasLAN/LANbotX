/**
 * Monitor, a governor for the bot kit worker
 */

export default (controller, worker) => {
  // Banned replies from lanbot
  const banned = ['@channel', '@here', '@group'];

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
}
