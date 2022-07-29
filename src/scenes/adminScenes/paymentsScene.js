const {
  Scenes: { BaseScene },
} = require("telegraf");
const { CustomWizardScene } = require("telegraf-steps-engine");
const Payments = require("../../Utils/payments");
const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");
const { getTitle } = require("telegraf-steps-engine/middlewares/titles");

const scene = new CustomWizardScene("paymentsScene").enter(async (ctx) => {
  const { edit, position, appointment_id } = ctx.scene.state;
  const connection = await tOrmCon;

  const paymentRequest = (
    await connection
      .query(
        "SELECT a.id, l.phone_number, l.username from appointments a, lawyers l where a.worker_id = l.id and status='finished' and a.is_payed = true limit 1"
      )
      .catch((e) => {
        ctx.replyWithTitle("DB_ERROR");
        console.log(e);
      })
  )?.[0];

  if (!paymentRequest) {
    await ctx.replyWithTitle("NO_NEW_PAYMENT_R");

    delete ctx.scene.state;

    return await ctx.scene.enter("adminScene");
  }

  ctx.replyWithKeyboard(
    "PAYMENT_LAWYER_INFO",
    { name: "i_paid_keyboard", args: [paymentRequest.id] },
    [paymentRequest.id, paymentRequest.username, paymentRequest.phone_number]
  );
});

scene.action(/^i_paid_(.+)$/g, (ctx) => {
  const appointment_id = ctx.match[1];

  ctx.answerCbQuery().catch(console.log);

  ctx.editMenu("CONFIRM_I_PAID", {
    name: "custom_keyboard",
    args: [["CONFIRM_BUTTON"], ["confirm_" + appointment_id]],
  });
});

scene.action(/^confirm_(.+)$/g, async (ctx) => {
  const appointment_id = ctx.match[1];

  const connection = await tOrmCon;

  await connection
    .query("update appointments set status='closed' where id  = $1", [
      appointment_id,
    ])
    .then(async (res) => {
      await ctx.answerCbQuery("PAYMENT_SUCCESS").catch(console.log);
      delete ctx.scene.state;
      await ctx.scene.enter("adminScene");
    })
    .catch(async (e) => {
      await ctx.answerCbQuery("DB_ERROR").catch(console.log);
      await ctx.scene.enter("adminScene");
      console.log(e);
    });
});

module.exports = scene;
