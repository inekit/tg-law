const { Telegraf, session } = require("telegraf");
const stages = require("./stages");
const shortcuts = require("telegraf-steps-engine/shortcuts/shortcuts");
const middlewares = require("telegraf-steps-engine/middlewares/middlewares");

const allowed_updates = ["message", "callback_query", "chat_member"];
const TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(TOKEN);

require("dotenv").config();
console.log("started");

(async () => {
  Object.assign(bot.context, shortcuts, middlewares);

  const ctx = { ...bot.context, telegram: bot.telegram };

  bot.use(
    session(),
    /*(new LocalSession({
           database: 'PublicStorage/sessions.json',
           storage: LocalSession.storageFileAsync,

         })).middleware(),*/
    stages
  );

  await bot.launch({
    allowedUpdates: allowed_updates,
    dropPendingUpdates: true,
  });

  //new Cron(ctx)

  /*
    if (process.env.NODE_ENV === "production") {
        bot.catch(console.error);

        await bot.startWebhook(`/bot`,
            `/${TOKEN}`, {
                key: readFileSync("./key.pem"),
                cert: readFileSync("./cert.pem"),
            },
            8443
        );
        console.log('webhook is started')

        /*const r = await bot.telegram.setWebhook(
           `https://${process.env.SERVER_IP}:8443/${TOKEN}`,
           {
             certificate: { source: "./cert.pem" },
             ip_address: process.env.SERVER_IP,
             allowed_updates,
             drop_pending_updates: true,
           }
         );
         console.log('webhook is set')'
    }
    */
})();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
