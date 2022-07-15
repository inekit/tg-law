const {
  Telegraf,
  Scenes: { Stage },
  Composer,
} = require("telegraf");
const { titles } = require("telegraf-steps-engine");
const stat = require("./Utils/statistics");
const checkSubscription = require("./Utils/checkSubscription");

const mainStage = new Stage(
  [
    require("./scenes/mainScene"),
    require("./scenes/clientScenes/buyScene"),
    require("./scenes/clientScenes/verificationScene"),

    require("./scenes/adminScene"),
    require("./scenes/adminScenes/adminsScene"),
  ],
  { default: "clientScene" }
);

mainStage.use(async (ctx, next) => {
  if (ctx.callbackQuery?.data) await ctx.answerCbQuery().catch((e) => {});
  if (!(await checkSubscription(ctx, process.env.PRIVATE_CHAT_ID)))
    return ctx.replyWithKeyboard("YOU_SHOULD_SUBSCRIBE", {
      name: "url_check_keyboard",
      args: ["LINK_PRIVATE"],
    });
  return next();
});

/*mainStage.on('photo',ctx=>{
	console.log(ctx.message.photo)
})*/

//mainStage.on('video_note',ctx=>console.log(ctx.message))

mainStage.start(async (ctx) => {
  stat.increaseUse(ctx.from?.id).catch((e) => {
    ctx.replyWithTitle(e.message);
  });

  ctx.scene.enter("clientScene");
});

mainStage.hears(titles.getValues("BUTTON_BACK_ADMIN"), (ctx) =>
  ctx.scene.enter("adminScene")
);
mainStage.hears(titles.getValues("BUTTON_ADMIN_MENU"), (ctx) =>
  ctx.scene.enter("adminScene")
);
mainStage.hears(titles.getValues("BUTTON_BACK_USER"), (ctx) =>
  ctx.scene.enter("clientScene")
);

const stages = new Composer();

stages.use(Telegraf.chatType("private", mainStage.middleware()));

module.exports = stages;
