const {
  Scenes: { BaseScene },
} = require("telegraf");

const { CustomWizardScene, createKeyboard } = require("telegraf-steps-engine");
const FilesHandler = require("../Utils/fileHandler");

const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../db/connection");
const { threadId } = require("worker_threads");
async function getUser(ctx) {
  const connection = await tOrmCon;

  let userObj = await connection
    .query(
      `SELECT l.id, username, a.id has_app, verification_status from lawyers l left join appointments a on a.worker_id = l.id where l.id = $1 limit 1;`,
      [ctx.from?.id]
    )
    .catch((e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  return userObj?.[0];
}

const clientScene = new CustomWizardScene("lawyerScene")
  .enter(async (ctx) => {
    let userObj = (ctx.scene.state.userObj = await getUser(ctx));

    const connection = await tOrmCon;

    if (!userObj) {
      userObj = await connection
        .getRepository("Lawyer")
        .save({
          id: ctx.from.id,
          username: ctx.from.username,
        })
        .catch(async (e) => {
          console.log(e);
          ctx.replyWithTitle("DB_ERROR");
        });
    }

    console.log(userObj?.verification_status);
    if (
      userObj?.verification_status === "created" ||
      !userObj?.verification_status
    )
      await ctx.replyWithKeyboard(ctx.getTitle("GREETING_LAWYER"), {
        name: "register_lawyer_keyboard",
        args: [userObj?.has_app],
      });
    else if (userObj?.verification_status !== "verified")
      await ctx.replyWithKeyboard(ctx.getTitle("MAIN_MENU_LAWYER"), {
        name: "register_lawyer_keyboard",
        args: [userObj?.has_app],
      });
    else {
      userObj?.has_app
        ? await ctx.replyWithKeyboard(
            ctx.getTitle("MAIN_MENU_LAWYER_VERIFIED"),
            "lawyer_orders_keyboard"
          )
        : await ctx.replyWithTitle(ctx.getTitle("MAIN_MENU_LAWYER_VERIFIED"));
    }
  })
  .addSelect({
    options: { REGISTER: "register" },
    cb: (ctx) => {
      ctx.replyNextStep();
    },
  })
  .addStep({
    variable: "fio",
    cb: (ctx) => {
      const fio =
        (ctx.wizard.state.temp =
        ctx.wizard.state.fio =
          ctx.message?.text);

      ctx.replyWithKeyboard("CHECK_ENTER", "check_enter_keyboard", [
        "ФИО",
        "ФИО",
        fio,
      ]);
    },
  })
  .addStep({
    variable: "phone_number",
    cb: (ctx) => {
      const phone =
        (ctx.wizard.state.temp =
        ctx.wizard.state.phone_number =
          ctx.message?.text);

      ctx.replyWithKeyboard("CHECK_ENTER", "check_enter_keyboard", [
        "Телефон",
        "Телефон",
        phone,
      ]);
    },
  })
  .addSelect({
    variable: "branch",
    header: "ENTER_BRANCH_LAWYER",
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
    variable: "city",
    header: "ENTER_CITY_LAWYER",
    cb: (ctx) => {
      const city =
        (ctx.wizard.state.temp =
        ctx.wizard.state.city =
          ctx.message?.text);

      ctx.replyWithKeyboard("CHECK_ENTER", "check_enter_keyboard", [
        "Город",
        "Город",
        city,
      ]);
    },
  })
  .addStep({
    variable: "sertificate",
    type: "action",
    handler: new FilesHandler(async (ctx) => {
      ctx.answerCbQuery().catch(console.log);

      ctx.wizard.state.sertificate = ctx.scene.state.input?.photo;

      const { sertificate, city, fio, phone_number, branch } =
        ctx.wizard.state ?? {};

      const connection = await tOrmCon;

      connection
        .query(
          "update lawyers set city = $1, fio = $2, sertificate = $3, phone_number = $4, branch = $5, verification_status = 'issued' where id = $6",
          [city, fio, sertificate, phone_number, branch, ctx.from.id]
        )
        .then(async (r) => {
          await ctx.replyWithTitle("VERIFICATION_APPOINTMENT_SUCCESS");

          delete ctx.scene.state;

          await ctx.scene.enter("mainScene");
        })
        .catch(async (e) => {
          await ctx.replyWithTitle("DB_ERROR");
          await ctx.replyStep(0, e);
          console.error(e);
        });
    }),
  });

clientScene.action("re_enter", (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  ctx.replyStep(ctx.wizard.cursor, true);
});
clientScene.action("next", async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  ctx.replyNextStep(true);
});

clientScene.action("get_orders", async (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  console.log(34344343);

  await ctx.scene.enter("appointmentsLawyerScene");
});

module.exports = clientScene;
