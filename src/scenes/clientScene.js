const {
  Scenes: { BaseScene },
} = require("telegraf");

const { CustomWizardScene, createKeyboard } = require("telegraf-steps-engine");

const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../db/connection");
async function getUser(ctx) {
  const connection = await tOrmCon;

  let userObj = await connection
    .query(
      `SELECT u.*, sum(case when worker_id is null then 1 else 0 end) a_count from users u left join appointments a on a.customer_id = u.id where u.id = $1 group by u.id limit 1`,
      [ctx.from?.id]
    )
    .catch((e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  return userObj?.[0];
}

const clientScene = new CustomWizardScene("clientScene")
  .enter(async (ctx) => {
    let userObj = (ctx.scene.state.userObj = await getUser(ctx));

    const connection = await tOrmCon;

    if (!userObj) {
      userObj = await connection
        .getRepository("User")
        .save({
          id: ctx.from.id,
          username: ctx.from.username,
        })
        .catch(async (e) => {
          console.log(e);
          ctx.replyWithTitle("DB_ERROR");
        });
    }

    await ctx.replyWithKeyboard(ctx.getTitle("GREETING"), {
      name: "new_appointment_keyboard",
      args: [userObj?.a_count],
    });
  })
  .addSelect({
    options: { NEW_APPOINTMENT: "new_appointment" },
    cb: (ctx) => {
      ctx.replyNextStep();
    },
  })
  .addSelect({
    header: "ATTENTION",
    options: { I_AGREE: "i_agree" },
    cb: (ctx) => {
      ctx.replyNextStep();
    },
  })
  .addStep({
    variable: "city",
    cb: (ctx) => {
      const city =
        (ctx.wizard.state.temp =
        ctx.wizard.state.city =
          ctx.message?.text);

      ctx.replyWithKeyboard("CHECK_ENTER", "check_enter_keyboard", [
        "Локация",
        "Локация",
        city,
      ]);
    },
  })
  .addSelect({
    variable: "branch",
    options: { "Уголовное право": "Уголовное право" },
    cb: (ctx) => {
      console.log(ctx);
      const branch =
        (ctx.wizard.state.temp =
        ctx.wizard.state.branch =
          ctx.match?.[0]);

      ctx.replyWithKeyboard("CHECK_ENTER", "check_enter_keyboard", [
        "Область права",
        "Область права",
        branch,
      ]);
    },
  })
  .addStep({
    variable: "description",
    cb: (ctx) => {
      const description =
        (ctx.wizard.state.temp =
        ctx.wizard.state.description =
          ctx.message?.text);

      ctx.replyWithKeyboard("CHECK_ENTER", "check_enter_keyboard", [
        "Описание",
        "Описание",
        description,
      ]);
    },
  })
  .addStep({
    variable: "price",
    cb: (ctx) => {
      const price =
        (ctx.wizard.state.temp =
        ctx.wizard.state.price =
          ctx.message?.text);

      ctx.replyWithKeyboard("CHECK_ENTER", "check_enter_keyboard", [
        "Стоимость",
        "Стоимость",
        price,
      ]);
    },
  })
  .addSelect({
    variable: "is_payed",
    options: { FREE: "false", PAID: "true" },
  })
  .addSelect({
    variable: "timeout",
    options: { HOUR: "60", "3H": "180" },
    cb: (ctx) => {
      console.log(ctx);
      const timeout =
        (ctx.wizard.state.temp =
        ctx.wizard.state.timeout =
          ctx.match?.[0]);

      const { price, description, branch, city } = ctx.wizard.state ?? {};

      ctx.replyWithKeyboard("APPOINTMENT_TOTAL", "check_enter_keyboard", [
        city,
        branch,
        description,
        price,
        timeout,
      ]);
    },
  });

clientScene.action("appointments", (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("appointmentsScene");
});

clientScene.command("review", (ctx) => ctx.scene.enter("reviewScene"));

clientScene.action("re_enter", (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  ctx.replyStep(ctx.wizard.cursor);
});
clientScene.action("next", async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  if (ctx.wizard.cursor === 7) {
    const { price, description, branch, city, timeout } =
      ctx.wizard.state ?? {};

    const connection = await tOrmCon;

    connection
      .query(
        "insert into appointments (customer_id, city, branch, description, price, timeout,is_payed) values ($1,$2,$3,$4,$5,$6,$7) returning id",
        [
          ctx.from.id,
          city,
          branch,
          description,
          price,
          timeout,
          ctx.scene.state.input.is_payed,
        ]
      )
      .then(async (res) => {
        ctx.replyWithKeyboard(
          "APPOINTMENT_SUCCESS",
          "new_appointment_keyboard"
        );

        const appointment_id = res?.[0]?.id;

        if (!appointment_id) return ctx.scene.enter("mainScene");

        const post_id = (ctx.scene.state.post_id = (
          await ctx.telegram.sendMessage(
            -1001503737085,
            ctx.getTitle("APPOINTMENT_TOTAL", [
              city,
              branch,
              description,
              price,
              ctx.scene.state.input.is_payed,
              timeout,
            ]),
            createKeyboard({ name: "i_gets", args: [appointment_id] }, ctx)
          )
        )?.message_id);

        connection
          .query("update appointments set post_id = $1 where id = $2", [
            post_id,
            appointment_id,
          ])
          .catch(console.log);

        ctx.telegram.sendMessage(
          296846972,
          ctx.getTitle("APPOINTMENT_TOTAL", [
            city,
            branch,
            description,
            price,
            ctx.scene.state.input.is_payed,
            timeout,
          ]),

          createKeyboard(
            { name: "drop_get_ap_keyboard", args: [appointment_id] },
            ctx
          )
        );

        ctx.wizard.selectStep(0);
      })
      .catch(async (e) => {
        await ctx.telegram
          .deleteMessage(-1001503737085, ctx.scene.state.post_id)
          .catch(console.log);
        await ctx.replyWithTitle("DB_ERROR");
        await ctx.replyStep(0);
        console.error(e);
      });
  } else ctx.replyNextStep();
});

module.exports = clientScene;
