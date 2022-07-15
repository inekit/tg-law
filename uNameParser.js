const { Telegraf, session } = require("telegraf");
const tOrmCon = require("./src/db/connection");
const allowed_updates = ["message", "callback_query", "chat_member"];
const TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(TOKEN);

console.log("started");

(async () => {
  Object.assign(bot.context);

  const ctx = { ...bot.context, telegram: bot.telegram };

  await bot.launch({
    allowedUpdates: allowed_updates,
    dropPendingUpdates: true,
  });

  const connection = await tOrmCon;

  const users = await connection.query("select id from users");

  console.log(users);
  for (u of users) {
    const fullUser = await ctx.telegram.getChatMember(u.id, u.id);

    const username = fullUser?.user?.username;

    if (!username) continue;

    await connection
      .query("update users set username = $1 where id = $2", [username, u.id])
      .catch(console.error);
  }

  bot.stop();
})();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
