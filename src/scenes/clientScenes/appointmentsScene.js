const {
  Scenes: { BaseScene },
} = require("telegraf");
const { CustomWizardScene } = require("telegraf-steps-engine");
const Payments = require("../../Utils/payments");
const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");
const clientScene = require("../mainScene");
require("dotenv").config();

const scene = new CustomWizardScene("appointmentsScene").enter(async (ctx) => {
  const { edit, order_id, type } = ctx.scene.state;

  if (order_id) return ctx.replyWithKeyboard("CHOOSE_RATE", "rate_keyboard");

  const connection = await tOrmCon;

  const orders =
    type === "issued"
      ? (ctx.scene.state.appointments = await connection
          .query(
            "SELECT * from appointments where worker_rate is null and customer_id = $1",
            [ctx.from.id]
          )
          .catch((e) => {
            ctx.replyWithTitle("DB_ERROR");
            console.log(e);
          }))
      : await connection
          .query(
            "SELECT * from appointments where worker_id is not null and customer_id = $1 and status <> 'finished'",
            [ctx.from.id]
          )
          .catch((e) => {
            ctx.replyWithTitle("DB_ERROR");
            console.log(e);
          });

  if (!orders?.length) {
    return await ctx.scene.enter("mainScene");
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
        .deleteMessage(process.env.CHANNEL_ID, post_id)
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
    .query(
      `update appointments set worker_rate = $1, status='finished' where id  = $2 returning worker_id`,
      [rate, ctx.scene.state.order_id]
    )
    .then(async (r) => {
      const worker_id = r?.[0]?.[0]?.worker_id;

      await connection
        .query(
          `update lawyers set rate = case when rate is null then $1 else ((rate * rate_count) + $1)/(rate_count+1) end, rate_count=rate_count+1 where id  = $2`,
          [rate, worker_id]
        )
        .catch(console.log);

      await ctx.replyWithTitle("RATE_SET");
      await ctx.telegram.sendMessage(
        worker_id,
        ctx.getTitle("YOU_RATED", [
          ctx.from.username,
          ctx.scene.state.order_id,
          rate,
        ])
      );
      await ctx.scene.enter("clientScene");
    })
    .catch(async (e) => {
      await ctx.replyWithTitle("DB_ERROR");
      await ctx.scene.enter("clientScene");
      console.log(e);
    });
});

module.exports = scene;
