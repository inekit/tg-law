const { Telegraf, session } = require("telegraf");
const tOrmCon = require("./src/db/connection");
const allowed_updates = ["message", "callback_query", "chat_member"];
const TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(TOKEN);

console.log("started");

const checkSubscription = async (ctx, groupId, userId) => {
  const member = await ctx.telegram
    .getChatMember(groupId, userId)
    .catch(console.log);

  if (!member) return false;

  if (
    member.status != "member" &&
    member.status != "administrator" &&
    member.status != "creator"
  ) {
    return false;
  } else {
    return true;
  }
};

(async () => {
  Object.assign(bot.context);

  const ctx = { ...bot.context, telegram: bot.telegram };

  await bot.launch({
    allowedUpdates: allowed_updates,
    dropPendingUpdates: true,
  });

  const connection = await tOrmCon;

  const users = await connection
    .query("select id from users")
    .catch(console.error);

  console.log(users);
  for (u of users) {
    const fullUser = await ctx.telegram
      .getChatMember(u.id, u.id)
      .catch(console.error);

    const { username, id } = fullUser?.user ?? {};

    if (!id) continue;

    const is_subscribed_private = await checkSubscription(
      ctx,
      process.env.PRIVATE_CHAT_ID,
      id
    );

    await connection
      .query(
        "update users set username = $1, is_subscribed_private=$2, lootbox_count=lootbox_count+$3 where id = $4",
        [username, is_subscribed_private, is_subscribed_private ? 1 : 0, u.id]
      )
      .catch(console.error);
  }

  bot.stop();
})();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
