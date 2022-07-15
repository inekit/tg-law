const {
  Scenes: { BaseScene },
} = require("telegraf");
const { CustomWizardScene } = require("telegraf-steps-engine");
const Payments = require("../../Utils/payments");
const { titles } = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");

const clientScene = new CustomWizardScene("buyScene")
  .enter(async (ctx) => {
    const { edit, userObj } = ctx.scene.state;

    const address = userObj?.wallet_arrd;

    if (!address) {
      ctx.replyWithTitle("NO_ADDRESS");
      ctx.scene.enter("clientScene");
    }

    if (edit)
      return ctx.replyWithKeyboard(
        ctx.getTitle("ENTER_COUNT"),
        "main_menu_back_keyboard"
      );

    ctx.replyWithTitle("ENTER_COUNT");
  })
  .addStep({
    variable: "count",
    cb: async (ctx) => {
      const count = (ctx.scene.state.count = parseInt(ctx.message?.text));

      if (count > 10) return ctx.replyWithTitle("SELECT_MAX_10");

      const sumCounter = count === 10 ? 0.9 : count >= 5 ? 0.95 : 1;

      let price = 100;

      let sum = (ctx.scene.state.sum = price * sumCounter * count);

      sum = ctx.scene.state.userObj?.nft_count === 0 ? sum - 40 : sum;

      sum = Math.round(sum * 100) / 100;

      const connection = await tOrmCon;

      const orderId = (ctx.wizard.state.orderId = (
        await connection
          .query(
            "insert into orders (count, sum, customer_id) values ($1, $2, $3) RETURNING id",
            [count, sum, ctx.from.id]
          )
          .catch((e) => {
            console.log(e);
            ctx.replyWithTitle("DB_ERROR");
            ctx.scene.reenter({ userObj: ctx.scene.state.userObj });
          })
      )?.[0]?.id);

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
    },
  })
  .addSelect({
    options: { 1: "submit_payment" },
    cb: async (ctx) => {
      const {
        paymentURL,
        sum: amount,
        orderId,
        userObj: { wallet_arrd },
      } = ctx.wizard.state;

      if (!(await Payments.isOrderPaid(orderId, amount, wallet_arrd)))
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
        await queryRunner.query(
          "update orders set status = 'payed' where customer_id = $1",
          [ctx.from.id]
        );
        await queryRunner.query(
          "update users set nft_count = nft_count+$2 where id = $1",
          [ctx.from.id, ctx.scene.state.count]
        );

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
