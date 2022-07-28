const {
  Scenes: { BaseScene },
} = require("telegraf");
const { CustomWizardScene } = require("telegraf-steps-engine");
const Payments = require("../../Utils/payments");
const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");
const clientScene = require("../mainScene");

const scene = new CustomWizardScene("reviewsScene").enter(async (ctx) => {
  const { edit, order_id } = ctx.scene.state;

  if (order_id) return ctx.replyWithKeyboard("CHOOSE_RATE", "rate_keyboard");

  const connection = await tOrmCon;

  const orders = (
    await connection
      .query(
        "SELECT * from appointments where worker_id is not null"
      )
      .catch((e) => {
        ctx.replyWithTitle("DB_ERROR");
        console.log(e);
      })
  );

  if (!orders) {
    await ctx.getTitle("NO_ORDERS_YET");

    return await ctx.scene.enter("clientScene")
  }


  ctx.replyWithKeyboard("CHOOSE_ORDER", {name: 'orders_reviews_keyboard', args: [orders]});
})

scene.on(/^order_(.+)$/g, ctx=>{
  const order_id = ctx.scene.state.order_id = ctx.match[1];

  ctx.replyWithKeyboard("CHOOSE_RATE", "rate_keyboard");
  
})

scene.on(/^rate_(.+)$/g, ctx=>{
  const rate = ctx.match[1];

  const connection = await tOrmCon;

  await connection.query("update appointments set worker_rate = $1 where id  = $2", [rate, ctx.scene.state.order_id])
  .then(async r=>{
    await ctx.replyWithTitle("RATE_SET");
    await ctx.scene.enter("appointmentAdminScene");
  })  
  .catch(async (e) => {
    await ctx.replyWithTitle("DB_ERROR");
    await ctx.scene.enter("appointmentAdminScene");
    console.log(e);
  })
  
})



module.exports = scene;
