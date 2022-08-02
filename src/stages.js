const {
  Telegraf,
  Scenes: { Stage },
  Composer,
} = require("telegraf");
const { titles } = require("telegraf-steps-engine");
const checkSubscription = require("./Utils/checkSubscription");
const tOrmCon = require("./db/connection");
const { constants } = require("buffer");

const mainStage = new Stage(
  [
    require("./scenes/mainScene"),
    require("./scenes/clientScene"),
    require("./scenes/lawyerScene"),
    require("./scenes/adminScene"),
    require("./scenes/adminScenes/appointmentAdminScene"),
    require("./scenes/lawyerScenes/appointmentsScene"),

    require("./scenes/adminScenes/lawyersScene"),
    require("./scenes/adminScenes/paymentsScene"),

    require("./scenes/clientScenes/appointmentsScene"),
  ],
  { default: "mainScene" }
);

/*mainStage.on('photo',ctx=>{
	console.log(ctx.message.photo)
})*/

//mainStage.on('video_note',ctx=>console.log(ctx.message))

mainStage.start(async (ctx) => {
  ctx.scene.enter("mainScene");
});

mainStage.hears(titles.getValues("BUTTON_BACK_ADMIN"), (ctx) =>
  ctx.scene.enter("adminScene")
);
mainStage.hears(titles.getValues("BUTTON_ADMIN_MENU"), (ctx) =>
  ctx.scene.enter("adminScene")
);
mainStage.hears(titles.getValues("BUTTON_BACK_USER"), (ctx) =>
  ctx.scene.enter("mainScene")
);

const stages = new Composer();
stages.use(Telegraf.chatType("private", mainStage.middleware()));

stages.action(/^drop_appointment_(.+)$/g, (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("appointmentAdminScene", {
    position: "drop",
    appointment_id: ctx.match[1],
  });
});

stages.action(/^choose_worker_(.+)$/g, (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("appointmentAdminScene", {
    position: "choose",
    appointment_id: ctx.match[1],
  });
});

stages.action(/^get_appointment_(.+)$/g, async (ctx) => {
  const connection = await tOrmCon;

  const res = await connection
    .query(
      `insert into answers (lawyer_id, appointment_id) select $1 as lawyer_id, $2 as appointment_id
      from lawyers l, appointments a where ((l.phone_number is not null and a.is_payed = true) or a.is_payed = false) and a.id=$2 limit 1 returning id`,
      [ctx.from.id, ctx.match[1]]
    )
    .then((res) => {
      if (res?.[0]?.id)
        ctx.answerCbQuery(ctx.getTitle("YOU_ANSWERED")).catch(console.log);
      else
        ctx
          .answerCbQuery(ctx.getTitle("YOU_ARE_NOT_REGISTERED"))
          .catch(console.log);
    })
    .catch(async (e) => {
      if (e.code == 23505)
        return ctx.answerCbQuery(ctx.getTitle("YOU_ALREADY_ANSWERED"));

      connection
        .getRepository("Lawyer")
        .save({
          id: ctx.from.id,
          username: ctx.from.username,
        })
        .catch(async (e) => {
          console.log(e);
          ctx
            .answerCbQuery(ctx.getTitle("YOU_NOT_ANSWERED"))
            .catch(console.log);
        });

      const res = await connection
        .query(
          `insert into answers (lawyer_id, appointment_id) select $1 as lawyer_id, $2 as appointment_id
          from lawyers l, appointments a where ((l.phone_number is not null and a.is_payed = true) or a.is_payed = false) and a.id=$2 limit 1`,
          [ctx.from.id, ctx.match[1]]
        )
        .catch(async (e) => {
          console.log(e);
          ctx
            .answerCbQuery(ctx.getTitle("YOU_NOT_ANSWERED"))
            .catch(console.log);
        });

      if (res?.[0]?.id)
        ctx.answerCbQuery(ctx.getTitle("YOU_ANSWERED")).catch(console.log);
      else
        ctx
          .answerCbQuery(ctx.getTitle("YOU_ARE_NOT_REGISTERED"))
          .catch(console.log);
    });
});

stages.on("forward_date", async (ctx, next) => {
  const chat_id = ctx.message.forward_from_chat.id;
  const message_id = ctx.message.forward_from_message_id;
  const from_id = ctx.message.from.id;
  console.log(chat_id, message_id);

  if (chat_id != process.env.CHANNEL_ID) return;

  const connection = await tOrmCon;

  const isLawyer =
    (
      await connection
        .query(
          "select * from lawyers where id = $1 and verification_status = 'verified'",
          [from_id]
        )
        .catch(console.error)
    )?.length > 0;

  if (!isLawyer) return;

  const {
    id: appointment_id,
    latitude,
    longitude,
  } = (
    await connection
      .query("select * from appointments where post_id = $1", [message_id])
      .catch(console.error)
  )?.[0];

  await ctx.replyWithTitle("VERIFIED_APP_DATA", [appointment_id]);

  if (latitude && longitude) await ctx.replyWithLocation(latitude, longitude);
});

module.exports = stages;
