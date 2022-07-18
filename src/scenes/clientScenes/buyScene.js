const {
  Scenes: { BaseScene },
} = require("telegraf");
const { CustomWizardScene } = require("telegraf-steps-engine");
const Payments = require("../../Utils/payments");
const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");

const clientScene = new CustomWizardScene("buyScene").enter(async (ctx) => {
  const { edit, userObj } = ctx.scene.state;

  const address = userObj?.wallet_addr;

  if (!address) {
    ctx.replyWithTitle("NO_ADDRESS");
    ctx.scene.enter("clientScene");
  }

  const connection = await tOrmCon;

  const order = (
    await connection
      .query(
        "select * from orders where customer_id = $1 and status <> 'payed'",
        [ctx.from.id]
      )
      .catch(async (e) => {
        console.error(`ERROR_GETTING_USER_ORDERS: ${ctx.from.username}: ${e}`);
        await ctx.scene.enter("clientScene");
      })
  )?.[0];

  if (order?.id) {
    const {
      link: paymentURL,
      comment,
      address,
    } = await Payments.getTransferInfo(order.sum, parseInt(order.id));

    ctx.scene.state.paymentURL = paymentURL;
    ctx.scene.state.sum = order.sum;
    ctx.scene.state.orderId = order.id;
    await ctx.replyWithKeyboard(ctx.getTitle("."), "main_menu_back_keyboard");

    await ctx.replyWithKeyboard(
      "ORDER_CREATED_TITLE",
      { name: "submit_payment_keyboard", args: [paymentURL, true] },
      [order.sum, address, comment, paymentURL]
    );

    return await ctx.wizard.selectStep(1);
  }

  if (edit)
    return ctx.replyWithKeyboard(
      ctx.getTitle("ENTER_COUNT"),
      "main_menu_back_keyboard"
    );

  ctx.replyWithTitle("ENTER_COUNT");
});

clientScene
  .action("drop_order", async (ctx) => {
    const connection = await tOrmCon;

    await connection
      .query("delete from orders where customer_id = $1", [ctx.from.id])
      .catch(async (e) => {
        console.error(`ERROR_DELETING_ORDER: ${ctx.from.username}: ${e}`);
        await ctx.scene.enter("clientScene");
      });

    await ctx.replyWithTitle("DROP_ORDER_SUCCESS");

    await ctx.replyWithKeyboard(
      ctx.getTitle("ENTER_COUNT"),
      "main_menu_back_keyboard"
    );

    return await ctx.wizard.selectStep(0);
  })

  .addStep({
    variable: "count",
    cb: async (ctx) => {
      try {
        if (!ctx.scene.state.userObj)
          throw new Error("NO_USER_OBJ_" + ctx.from.username);

        const count = (ctx.scene.state.count = parseInt(ctx.message?.text));

        if (parseInt(count) != count) return;

        if (count > 10) return ctx.replyWithTitle("SELECT_MAX_10");

        const sumCounter = count === 10 ? 0.9 : count >= 5 ? 0.95 : 1;

        let price = 100;

        let sum = price * sumCounter * count;

        sum = ctx.scene.state.userObj?.nft_count === 0 ? sum - 40 : sum;

        sum = ctx.scene.state.sum = Math.round(sum * 100) / 100;

        const connection = await tOrmCon;

        const orderId = (ctx.wizard.state.orderId = (
          await connection.query(
            "insert into orders (count, sum, customer_id) values ($1, $2, $3) RETURNING id",
            [count, sum, ctx.from.id]
          )
        )?.[0]?.id);

        if (!orderId) throw new Error("CANT_GET_ORDER_ID_" + ctx.from.username);

        const {
          link: paymentURL,
          comment,
          address,
        } = await Payments.getTransferInfo(sum, parseInt(orderId));

        ctx.wizard.state.paymentURL = paymentURL;

        await ctx.replyWithKeyboard(
          "ORDER_CREATED_TITLE",
          { name: "submit_payment_keyboard", args: [paymentURL] },
          [sum, address, comment, paymentURL]
        );

        ctx.wizard.next();
      } catch (e) {
        console.error(`ERROR CREATING APPOINTMENT: ${ctx.from.username}: ${e}`);
        await ctx.replyWithTitle("DB_ERROR");
        await ctx.scene.enter("clientScene");
      }
    },
  })
  .addSelect({
    options: { 1: "submit_payment" },
    cb: async (ctx) => {
      const {
        paymentURL,
        sum: amount,
        orderId,
        userObj: { wallet_addr },
      } = ctx.wizard.state;

      if (!wallet_addr || !orderId || !amount || !paymentURL) {
        ctx.replyWithTitle("BOT_RELOADED");
        console.error(
          `NO_CHECK_TRANSACTION_DATA,addr=${wallet_addr}, orderId = ${orderId}, amount = ${amount}, url = ${paymentURL}`
        );
        return await ctx.scene.enter("clientScene");
      }

      if (!(await Payments.isOrderPaid(orderId, amount, wallet_addr)))
        return ctx.replyWithKeyboard(
          "ORDER_NOT_PAYED",
          { name: "submit_payment_keyboard", args: [paymentURL] },
          [amount]
        );

      const connection = await tOrmCon;

      const queryRunner = connection.createQueryRunner();

      await queryRunner.connect();

      await queryRunner.startTransaction();

      try {
        const setPayedStatus = !!(
          await queryRunner
            .query(
              "update orders set status = 'payed' where customer_id = $1 and id = $2",
              [ctx.from.id, orderId]
            )
            .catch((e) => {
              throw new Error("ERROR_UPDATING_STATUS: ", e);
            })
        )?.[1];

        if (!setPayedStatus) throw new Error("NOTHING_TO_UPDATING_STATUS");

        const setNFTCountStatus = !!(
          await queryRunner
            .query("update users set nft_count = nft_count+$2 where id = $1", [
              ctx.from.id,
              ctx.scene.state.count,
            ])
            .catch((e) => {
              throw new Error("ERROR_UPDATING_COUNT: ", e);
            })
        )?.[1];

        if (!setNFTCountStatus) throw new Error("NOTHING_TO_UPDATING_COUNT");

        await queryRunner.commitTransaction();

        await ctx.replyWithTitle("ORDER_SUCCESS");
      } catch (err) {
        await queryRunner.rollbackTransaction();

        console.log(err);
        await ctx.replyWithTitle("DB_ERROR");
      } finally {
        await queryRunner.release();
        return await ctx.scene.enter("clientScene");
      }
    },
  });

module.exports = clientScene;
