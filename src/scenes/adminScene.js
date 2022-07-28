const {
  Composer,
  Scenes: { BaseScene, WizardScene },
} = require("telegraf");
const titles = require("telegraf-steps-engine/middlewares/titles");
const main_menu_button = "admin_back_keyboard";
const tOrmCon = require("../db/connection");
const noneListener = new Composer(),
  addListener = new Composer(),
  captchaListener = new Composer(),
  userIdListener = new Composer();
const adminScene = new WizardScene(
  "adminScene",
  noneListener,
  addListener,
  captchaListener,
  userIdListener
);

adminScene.enter(async (ctx) => {
  await ctx.replyWithKeyboard(
    ctx.getTitle("ADMIN_MENU"),
    "admin_main_keyboard"
  );
});

adminScene.hears(titles.getValues("BUTTON_CHANGE_TEXT"), (ctx) =>
  ctx.scene.enter("changeTextScene", { main_menu_button })
);

adminScene.hears(titles.getValues("BUTTON_ADMINS"), (ctx) =>
  ctx.scene.enter("adminsScene", { main_menu_button })
);

adminScene.hears(titles.getValues("BUTTON_CLIENT_MENU"), (ctx) =>
  ctx.scene.enter("adminsScene")
);

adminScene.action("appointments", (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  ctx.scene.enter("appointmentAdminScene");
});

adminScene.action("lawyers", (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  ctx.scene.enter("lawyersScene");
});

module.exports = adminScene;
