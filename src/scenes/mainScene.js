const {
  Scenes: { BaseScene },
} = require("telegraf");

const scene = new BaseScene("mainScene").enter(async (ctx) => {
  await ctx.replyWithKeyboard(
    ctx.getTitle("GREETING_MAIN"),
    "main_menu_keyboard"
  );
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
