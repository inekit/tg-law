const {
  Scenes: { BaseScene },
} = require("telegraf");
const ADMIN_ID = process.env.ADMIN_ID;

const scene = new BaseScene("mainScene").enter(async (ctx) => {
  const isAdmin = ctx.from.id == ADMIN_ID;
  await ctx.replyWithKeyboard(ctx.getTitle("GREETING_MAIN"), {
    name: "main_menu_keyboard",
    args: [isAdmin],
  });
});

scene.action("enter_lawyer", (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  ctx.scene.enter("lawyerScene");
});

scene.action("enter_client", (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  ctx.scene.enter("clientScene");
});

scene.action("enter_admin", (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  ctx.scene.enter("adminScene");
});

module.exports = scene;
