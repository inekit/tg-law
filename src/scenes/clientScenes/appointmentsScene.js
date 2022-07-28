const {
  Scenes: { BaseScene },
} = require("telegraf");
const { CustomWizardScene } = require("telegraf-steps-engine");
const Payments = require("../../Utils/payments");
const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");
const clientScene = require("../mainScene");

const scene = new CustomWizardScene("appointmentsScene").enter(async (ctx) => {
  const { edit, order_id } = ctx.scene.state;

  if (order_id) return ctx.replyWithKeyboard("CHOOSE_RATE", "rate_keyboard");

  const connection = await tOrmCon;

  const orders = (ctx.scene.state.appointments = await connection
    .query("SELECT * from appointments where worker_rate is null")
    .catch((e) => {
      ctx.replyWithTitle("DB_ERROR");
      console.log(e);
    }));

  if (!orders) {
    await ctx.getTitle("NO_ORDERS_YET");

    return await ctx.scene.enter("clientScene");
  }

  ctx.replyWithKeyboard("CHOOSE_ORDER", {
    name: "orders_reviews_keyboard",
    args: [orders],
  });
});

scene.action(/^appointment_(.+)$/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  const order_id = (ctx.scene.state.order_id = ctx.match[1]);

  ctx.replyWithKeyboard("CONFIRM_CANCEL_APPOINTMENT", {
    name: "custom_keyboard",
    args: [["CONFIRM"], ["cancel_" + order_id]],
  });
});

scene.action(/^cancel_(.+)$/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  const order_id = (ctx.scene.state.order_id = ctx.match[1]);

  const connection = await tOrmCon;

  await connection
    .query("delete from appointments where id = $1", [order_id])
    .then(async (res) => {
      const post_id = ctx.scene.state.appointments?.find(
        (el) => el.id == order_id
      )?.post_id;

      console.log(post_id);

      await ctx.telegram
        .deleteMessage(-1001503737085, post_id)
        .catch(console.log);

      await ctx.replyWithTitle("APPOINTMENT_CANCELLED");
      await ctx.scene.enter("clientScene");
    })
    .catch(async (e) => {
      await ctx.replyWithTitle("DB_ERROR");
      await ctx.scene.enter("clientScene");
      console.log(e);
    });
});

scene.action(/^order_(.+)$/g, (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  const order_id = (ctx.scene.state.order_id = ctx.match[1]);

  ctx.replyWithKeyboard("CHOOSE_RATE", "rate_keyboard");
});

scene.action(/^rate_(.+)$/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  const rate = ctx.match[1];

  const connection = await tOrmCon;

  await connection
    .query("update appointments set worker_rate = $1 where id  = $2", [
      rate,
      ctx.scene.state.order_id,
    ])
    .then(async (r) => {
      await ctx.replyWithTitle("RATE_SET");
      await ctx.scene.enter("clientScene");
    })
    .catch(async (e) => {
      await ctx.replyWithTitle("DB_ERROR");
      await ctx.scene.enter("clientScene");
      console.log(e);
    });
});

module.exports = scene;
