const {
  Scenes: { BaseScene },
} = require("telegraf");
const { CustomWizardScene } = require("telegraf-steps-engine");
const Payments = require("../../Utils/payments");
const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");
const clientScene = require("../mainScene");
const {
  custom_keyboard,
} = require("telegraf-steps-engine/middlewares/inlineKeyboards");
require("dotenv").config();

const scene = new BaseScene("appointmentsLawyerScene").enter(async (ctx) => {
  const connection = await tOrmCon;

  const orders = (ctx.scene.state.orders = await connection
    .query(
      "SELECT * from appointments where worker_id = $1 and status <> 'finished'  and status <> 'closed'",
      [ctx.from.id]
    )
    .catch((e) => {
      ctx.replyWithTitle("DB_ERROR");
      console.log(e);
    }));

  if (!orders?.length) {
    return await ctx.scene.enter("mainScene");
  }

  ctx.replyWithKeyboard("CHOOSE_ORDER_LAWYER", {
    name: "orders_lawyer_keyboard",
    args: [orders],
  });
});

scene.action("go_back", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  delete ctx.scene.state;

  await ctx.scene.enter("appointmentsLawyerScene");
});

scene.action(/^order_(.+)$/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  const order_id = ctx.match[1];

  const {
    price,
    description,
    branch,
    city,
    timeout,
    is_payed,
    latitude,
    longitude,
  } = ctx.scene.state.orders?.find(({ id }) => id == order_id) ?? {};

  if (latitude && longitude) await ctx.replyWithLocation(latitude, longitude);

  ctx.replyWithKeyboard(
    ctx.getTitle("APPOINTMENT_TOTAL_LAWYER", [
      order_id,
      city,
      branch,
      description,
      price,
      is_payed ? "Да" : "Нет",
      timeout,
    ]),
    "go_back_keyboard"
  );
});

module.exports = scene;
