const {
  Scenes: { BaseScene },
} = require("telegraf");
const { CustomWizardScene } = require("telegraf-steps-engine");
const Payments = require("../../Utils/payments");
const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");
const { getTitle } = require("telegraf-steps-engine/middlewares/titles");
const { admin } = require("telegraf-steps-engine/scene");
const adminScene = require("../adminScene");
require("dotenv").config();

const scene = new CustomWizardScene("appointmentAdminScene")
  .enter(async (ctx) => {
    const { edit, position, appointment_id } = ctx.scene.state;

    console.log(position, appointment_id);
    const connection = await tOrmCon;

    if (position && appointment_id) {
      if (position === "drop") {
        ctx.wizard.state.post_id = (
          await connection
            .query("SELECT post_id from appointments a where id = $1 limit 1", [
              appointment_id,
            ])
            .catch((e) => {
              ctx.replyWithTitle("DB_ERROR");
              console.log(e);
            })
        )?.[0]?.post_id;

        return ctx.editMenu("CONFIRM_DROP", "confirm_keyboard");
      } else if (position === "choose") {
        const workers = await connection
          .query(
            "SELECT * from answers an, lawyers l where an.lawyer_id = l.id and appointment_id = $1",
            [ctx.wizard.state.appointment_id]
          )
          .catch((e) => {
            ctx.replyWithTitle("DB_ERROR");
            console.log(e);
          });

        console.log(workers);

        if (!workers?.length) {
          return await ctx.replyWithTitle("NO_WORKERS");
        }

        return ctx.editMenu("CHOOSE_WORKER", {
          name: "choose_worker_keyboard",
          args: [workers],
        });
      }
    }

    const appointment = (
      await connection
        .query(
          "SELECT a.*, count(an.id) lawyers_count FROM appointments a left join answers an on an.appointment_id = a.id where a.worker_id is null group by a.id"
        )
        .catch((e) => {
          ctx.replyWithTitle("DB_ERROR");
          console.log(e);
        })
    )?.[0];

    if (!appointment) {
      await ctx.replyWithTitle("NO_APPOINTMENTS_YET");
      return ctx.scene.enter("adminScene");
    }

    ctx.wizard.state.appointment_id = appointment?.id;
    ctx.wizard.state.post_id = appointment?.post_id;

    ctx.replyWithKeyboard("APPOINTMENT_INFO", "drop_get_ap_keyboard_main", [
      appointment.id,
      appointment.city,
      appointment.branch,
      appointment.description,
      appointment.price,
      appointment.timeout,
    ]);
  })
  .addSelect({
    options: { CONFIRM: "confirm" },
    cb: async (ctx) => {
      const connection = await tOrmCon;

      await connection
        .query("delete from appointments where id = $1 returning post_id", [
          ctx.wizard.state.appointment_id,
        ])
        .then(async (res) => {
          const post_id = ctx.wizard.state.post_id;

          await ctx.telegram
            .deleteMessage(process.env.CHANNEL_ID, post_id)
            .catch(console.log);

          await ctx.editMenu("APPOINTMENT_DELETED");

          ctx.scene.enter("adminScene");
        })
        .catch((e) => {
          ctx.replyWithTitle("DB_ERROR");
          console.log(e);
        });
    },
  });

scene.action("drop_appointment_main", (ctx) => {
  ctx.replyWithKeyboard("CONFIRM_DROP", "confirm_keyboard");
});

scene.action("choose_worker_main", async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  const connection = await tOrmCon;

  const workers = await connection
    .query(
      "SELECT * from answers an, lawyers l where an.lawyer_id = l.id and appointment_id = $1",
      [ctx.wizard.state.appointment_id]
    )
    .catch((e) => {
      ctx.replyWithTitle("DB_ERROR");
      console.log(e);
    });

  if (!workers?.length) {
    await ctx.editMenu("NO_WORKERS");
    return ctx.scene.enter("adminScene");
  }

  ctx.editMenu("CHOOSE_WORKER", {
    name: "choose_worker_keyboard",
    args: [workers],
  });
});

scene.action(/^worker_(.+)$/g, async (ctx) => {
  const lawyer_id = ctx.match[1];

  const connection = await tOrmCon;

  await connection
    .query(
      "update appointments set worker_id = $1 , status = 'workerset' where id  = $2 returning *",
      [lawyer_id, ctx.wizard.state.appointment_id]
    )
    .then(async (res) => {
      const { customer_id, city, id, branch, description, price, is_payed } =
        res?.[0]?.[0] ?? {};
      await ctx.answerCbQuery("WORKER_SET").catch(console.log);
      await ctx.scene.enter("adminScene");

      const customer = (
        await connection
          .query("select * from users where id = $1", [customer_id])
          .catch(console.log)
      )?.[0];

      await ctx.telegram
        .sendMessage(
          lawyer_id,
          ctx.getTitle("NEW_APPOINTMENT_LAWYER", [
            id,
            city,
            branch,
            description,
            price,
            is_payed ? "Да" : "Нет",
            customer?.username ?? customer_id,
          ])
        )
        .catch(console.log);

      const un = await ctx.telegram
        .getChatMember(lawyer_id, lawyer_id)
        .catch(console.log);

      console.log(un);

      await ctx.telegram
        .sendMessage(
          customer_id,
          ctx.getTitle("LAWYER_FOUND", [un?.user?.username ?? lawyer_id])
        )
        .catch(console.log);
    })
    .catch(async (e) => {
      await ctx.answerCbQuery("DB_ERROR").catch(console.log);
      await ctx.scene.enter("adminScene");
      console.log(e);
    });
});

module.exports = scene;
