const {
  Scenes: { BaseScene },
  Composer,
} = require("telegraf");

const { CustomWizardScene, createKeyboard } = require("telegraf-steps-engine");
require("dotenv").config();

const getPaymentLink = require("../Utils/payments");
const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../db/connection");
async function getUser(ctx) {
  const connection = await tOrmCon;

  let userObj = await connection
    .query(
      `SELECT u.*, 
      sum(case when (a.id is not null and worker_id is null) then 1 else 0 end) a_count,
      sum(case when (a.status='workerset') then 1 else 0 end) f_count 
      from users u left join appointments a on a.customer_id = u.id where u.id = $1 group by u.id limit 1`,
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
      args: [userObj?.a_count, userObj?.f_count],
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
    options: {
      "Гражданское право": "Гражданское право",
      "Уголовное право": "Уголовное право",
      "Арбитражные споры": "Арбитражные споры",
      "Защита военнослужащих": "Защита военнослужащих",
      "Защита прав потребителей": "Защита прав потребителей",
      "Исполнительное производство": "Исполнительное производство",
    },
    onInput: (ctx) => {
      console.log(ctx);
      const branch =
        (ctx.wizard.state.temp =
        ctx.wizard.state.branch =
          ctx.message.text);

      ctx.replyWithKeyboard("CHECK_ENTER", "check_enter_keyboard", [
        "Область права",
        "Область права",
        branch,
      ]);
    },
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
  .addStep({
    variable: "location",
    handler: (() => {
      const c = new Composer();

      c.on("location", async (ctx) => {
        ctx.wizard.state.longitude = ctx.message.location.longitude;
        ctx.wizard.state.latitude = ctx.message.location.latitude;
        await ctx.replyWithHTML(".", {
          reply_markup: { remove_keyboard: true },
        });
        ctx.replyNextStep();
      });

      c.hears(titles.getValues("BUTTON_SKIP"), async (ctx) => {
        await ctx.replyWithHTML(".", {
          reply_markup: { remove_keyboard: true },
        });
        ctx.replyNextStep();
      });

      return c;
    })(),
  })
  .addSelect({
    variable: "timeout",
    options: { HOUR: "60", "3H": "180" },
    cb: (ctx) => {
      const timeout =
        (ctx.wizard.state.temp =
        ctx.wizard.state.timeout =
          ctx.match?.[0]);

      ctx.replyWithKeyboard("CHECK_ENTER", "check_enter_keyboard", [
        "Время жизни заявки",
        "Время жизни заявки",
        timeout + " минут",
      ]);
    },
  })
  .addSelect({
    variable: "is_payed",
    options: { FREE: "false", PAID: "true" },
    cb: (ctx) => {
      console.log(ctx);
      const is_payed =
        (ctx.wizard.state.temp =
        ctx.wizard.state.is_payed =
          ctx.match?.[0] === "true");

      const { price, description, branch, city, timeout } =
        ctx.wizard.state ?? {};

      ctx.replyWithKeyboard("APPOINTMENT_TOTAL", "check_enter_keyboard", [
        city,
        branch,
        description,
        price,
        is_payed ? "Да" : "Нет",
        timeout,
      ]);
    },
  })
  .addSelect({
    options: { I_PAID_A: "i_paid_a" },
    cb: async (ctx) => {
      const connection = await tOrmCon;

      if (!ctx.scene.state.appointment_id) return ctx.scene.enter("mainScene");

      const res = await connection
        .query(
          "select case when status='paid' then 1 else 0 end as is_paid from appointments where id = $1",
          [ctx.scene.state.appointment_id]
        )
        .catch(console.error);

      if (!res?.[0]) return ctx.scene.enter("mainScene");

      const is_paid = res?.[0]?.is_paid;

      if (!is_paid)
        return ctx
          .answerCbQuery(ctx.getTitle("YOU_NOT_PAID"))
          .catch(console.log);

      await sendAppointment(ctx, ctx.scene.state.appointment_id);
    },
  });

clientScene.action("appointments", (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("appointmentsScene", { type: "issued" });
});

clientScene.action("finished", (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("appointmentsScene", { type: "finished" });
});

clientScene.command("review", (ctx) => ctx.scene.enter("reviewScene"));

clientScene.action("re_enter", (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  ctx.replyStep(ctx.wizard.cursor);
});
clientScene.action("next", async (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  const connection = await tOrmCon;

  if (ctx.wizard.cursor === 5) {
    ctx.wizard.selectStep(6);
    return ctx.replyWithKeyboard("ENTER_LOCATION", "location_keyboard");
  }
  if (ctx.wizard.cursor === 8) {
    const {
      price,
      description,
      branch,
      city,
      timeout,
      is_payed,
      latitude,
      longitude,
    } = ctx.wizard.state ?? {};

    connection
      .query(
        `insert into appointments 
         (customer_id, city, branch, description, price, timeout,is_payed, status, latitude, longitude)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id`,
        [
          ctx.from.id,
          city,
          branch,
          description,
          price,
          timeout,
          is_payed,
          is_payed ? "issued" : "paid",
          latitude,
          longitude,
        ]
      )
      .then(async (res) => {
        const appointment_id = (ctx.scene.state.appointment_id = res?.[0]?.id);

        if (!appointment_id) return ctx.scene.enter("mainScene");

        if (is_payed) {
          const link = await getPaymentLink(appointment_id);

          ctx.replyWithKeyboard("PAY_FOR_A", {
            name: "pay_link_kb",
            args: [link],
          });

          return ctx.wizard.next();
        }

        await sendAppointment(ctx, appointment_id);
      })
      .catch(async (e) => {
        await ctx.telegram
          .deleteMessage(process.env.CHANNEL_ID, ctx.scene.state.post_id)
          .catch(console.log);
        await ctx.replyWithTitle("DB_ERROR");
        await ctx.replyStep(0, true);
        console.error(e);
      });
  } else ctx.replyNextStep(true);
});

async function sendAppointment(ctx, appointment_id) {
  const { price, description, branch, city, timeout, is_payed } =
    ctx.wizard.state ?? {};

  ctx.replyWithKeyboard("APPOINTMENT_SUCCESS", "new_appointment_keyboard");

  const post_id = (ctx.scene.state.post_id = (
    await ctx.telegram.sendMessage(
      process.env.CHANNEL_ID,
      ctx.getTitle("APPOINTMENT_TOTAL", [
        city,
        branch,
        description,
        price,
        is_payed ? "Да" : "Нет",
        timeout,
      ]),
      createKeyboard({ name: "i_gets", args: [appointment_id] }, ctx)
    )
  )?.message_id);

  const connection = await tOrmCon;

  connection
    .query("update appointments set post_id = $1 where id = $2", [
      post_id,
      appointment_id,
    ])
    .catch(console.log);

  ctx.telegram.sendMessage(
    process.env.ADMIN_ID,
    ctx.getTitle("APPOINTMENT_TOTAL", [
      city,
      branch,
      description,
      price,
      is_payed ? "Да" : "Нет",
      timeout,
    ]),

    createKeyboard(
      { name: "drop_get_ap_keyboard", args: [appointment_id] },
      ctx
    )
  );

  ctx.wizard.selectStep(0);
}

module.exports = clientScene;
