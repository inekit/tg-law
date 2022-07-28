const {
  Scenes: { BaseScene },
} = require("telegraf");
const { CustomWizardScene } = require("telegraf-steps-engine");
const Payments = require("../../Utils/payments");
const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");
const { getTitle } = require("telegraf-steps-engine/middlewares/titles");

const scene = new CustomWizardScene("lawyersScene").enter(async (ctx) => {
  const { edit, position, appointment_id } = ctx.scene.state;
  const connection = await tOrmCon;

  const lawyer = (
    await connection
      .query(
        "SELECT * from lawyers where verification_status = 'issued' limit 1"
      )
      .catch((e) => {
        ctx.replyWithTitle("DB_ERROR");
        console.log(e);
      })
  )?.[0];

  if (!lawyer) {
    await ctx.replyWithTitle("NO_NEW_LAYERS");

    delete ctx.scene.state;

    return await ctx.scene.enter("adminScene");
  }

  await ctx.replyWithPhoto(lawyer.sertificate).catch(console.log);

  ctx.replyWithKeyboard(
    "LAWYER_INFO",
    { name: "drop_verify_keyboard", args: [lawyer.id] },
    [
      lawyer.username,
      lawyer.fio,
      lawyer.phone_number,
      lawyer.branch,
      lawyer.city,
    ]
  );
});

scene.action(/^skip_(.+)$/g, (ctx) => {
  const lawyer_id = ctx.match[1];

  ctx.answerCbQuery().catch(console.log);

  ctx.editMenu("CONFIRM_DROP_LAWYER", {
    name: "custom_keyboard",
    args: [["CONFIRM_BUTTON"], ["cancelled_" + lawyer_id]],
  });
});

scene.action(/^verify_(.+)$/g, async (ctx) => {
  const lawyer_id = ctx.match[1];

  ctx.answerCbQuery().catch(console.log);

  ctx.editMenu("CONFIRM_VERIFY", {
    name: "custom_keyboard",
    args: [["CONFIRM_BUTTON"], ["verified_" + lawyer_id]],
  });
});

scene.action(/^(verified|cancelled)_(.+)$/g, async (ctx) => {
  const lawyer_id = ctx.match[2];
  const status = ctx.match[1];

  const connection = await tOrmCon;

  await connection
    .query("update lawyers set verification_status = $2 where id  = $1", [
      lawyer_id,
      status,
    ])
    .then(async (res) => {
      await ctx.answerCbQuery("VERIFICATION_SUCCESS").catch(console.log);
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
