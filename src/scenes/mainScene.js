const {
  Scenes: { BaseScene },
} = require("telegraf");

const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../db/connection");

const clientScene = new BaseScene("clientScene").enter(async (ctx) => {
  let userObj = (ctx.scene.state.userObj = await getUser(ctx));

  const name = getUserName(ctx);

  const connection = await tOrmCon;

  if (!userObj) {
    await ctx.replyWithTitle("GREETING");

    userObj = await connection
      .getRepository("User")
      .save({ id: ctx.from.id, username: ctx.from.username })
      .catch(async (e) => {
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });
  }

  const { nft_count, lootbox_count, wl_count, wallet_addr, user_id } =
    userObj ?? {};

  if (!wallet_addr) return await ctx.scene.enter("verificationScene");

  if (user_id) {
  } else if (userObj?.login_ago !== "0") {
    await connection
      .query(
        "UPDATE users u SET last_use = now(), username = $2 WHERE id = $1",
        [ctx.from?.id, ctx.from?.username]
      )
      .catch((e) => {
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });
  }

  await ctx.replyWithKeyboard(
    ctx.getTitle("HOME_MENU", [name, wl_count, lootbox_count, nft_count]),
    {
      name: "main_keyboard",
      args: [user_id],
    }
  );
});

async function sendRules(ctx) {
  const name = ctx.from?.first_name ?? ctx.from?.username ?? "Друг";

  await ctx
    .replyWithVideoNote(ctx.getTitle("VIDEO_NOTE_RULES_ID"))
    .catch((e) => {});

  ctx.replyWithTitle("RULES_TITLE", [name]);
}
clientScene.hears(
  titles.getTitle("BUTTON_RULES", "ru"),
  async (ctx) => await sendRules(ctx)
);

clientScene.command("help", async (ctx) => await sendRules(ctx));

clientScene.hears(titles.getTitle("BUTTON_FAQ", "ru"), async (ctx) => {
  await ctx.replyWithTitle("FAQ", [getUserName(ctx)]);
});

clientScene.hears(titles.getTitle("BUTTON_ABOUT", "ru"), async (ctx) => {
  await ctx.replyWithTitle("ABOUT", [getUserName(ctx)]);
});

clientScene.hears(titles.getTitle("BUTTON_ENTER_GROUP", "ru"), async (ctx) => {
  await ctx.replyWithKeyboard("ENTER_GROUP", {
    name: "url_keyboard",
    args: [ctx.getTitle("MAIN_CHAT_LINK")],
  });
});

clientScene.hears(
  titles.getTitle("BUTTON_CHANGE_ADDRESS", "ru"),
  async (ctx) => await ctx.scene.enter("verificationScene", { edit: true })
);

clientScene.hears(
  titles.getTitle("BUTTON_BUY_NFT", "ru"),
  async (ctx) =>
    await ctx.scene.enter("buyScene", {
      userObj: ctx.scene.state.userObj,
      edit: true,
    })
);

clientScene.hears(titles.getTitle("ADMIN_SCENE_BUTTON", "ru"), (ctx) => {
  ctx.scene
    .enter("adminScene")
    .catch((e) => ctx.replyWithTitle(`Нет такой сцены`));
});

clientScene.hears(titles.getTitle("HELP_MODE", "ru"), async (ctx) => {
  ctx.scene.state.isHelpMode = true;
  await ctx.replyWithTitle("ENTER_MESSAGE");
});
clientScene.on("message", async (ctx) => {
  if (!ctx.message?.text || !ctx.scene.state.isHelpMode) return;

  ctx.scene.state.helpMessage = ctx.message.text;

  ctx.scene.state.message_id = ctx.message.message_id;

  ctx.scene.state.chat_id = ctx.message.chat.id;

  ctx.replyWithKeyboard("CONFIRM", "confirm_keyboard");
});
clientScene.action("confirm", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  await ctx.replyWithTitle("MESSAGE_SEND");

  if (ctx.from.username)
    await ctx.telegram
      .sendMessage(
        5039673361,
        ctx.getTitle("NEW_HELP", [
          ctx.from.username ?? ctx.from.id,
          ctx.scene.state.helpMessage,
        ])
      )
      .catch((e) => {
        console.log("help guy has blocked bot");
      });
  else
    await ctx.telegram
      .forwardMessage(
        5039673361,
        ctx.scene.state.chat_id,
        ctx.scene.state.message_id
      )
      .catch(() => {});

  ctx.scene.state.isHelpMode = false;
});

async function getUser(ctx) {
  const connection = await tOrmCon;

  let userObj = await connection
    .query(
      `SELECT u.id, DATE_PART('day', now() - u.last_use) login_ago,user_id, wallet_addr, nft_count, lootbox_count, wl_count
      FROM users u left join admins a on a.user_id = u.id where u.id = $1 limit 1`,
      [ctx.from?.id]
    )
    .catch((e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  return userObj?.[0];
}

const getUserName = (ctx) =>
  ctx.from?.first_name ?? ctx.from?.username ?? "Друг";

module.exports = clientScene;
