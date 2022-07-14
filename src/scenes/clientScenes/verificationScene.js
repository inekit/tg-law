const { Scenes: { BaseScene } } = require('telegraf');
const { CustomWizardScene } = require('telegraf-steps-engine')
const Payments = require("../../Utils/payments")
const { titles } = require('telegraf-steps-engine');
const scene = require('../adminScenes/adminsScene');
const tOrmCon = require("../../db/connection");

const clientScene = new CustomWizardScene('verificationScene')
.enter(async ctx=>{

  const { edit } = ctx.scene.state;

  if (edit) return ctx.replyWithHTML(ctx.getTitle("ENTER_ADDRESS"), {reply_markup: {remove_keyboard: true}})
  
  await ctx.replyWithKeyboard(ctx.getTitle("ADD_ADDRESS_TITLE"),
  {name: 'custom_keyboard', args: [['BUTTON_ADD_ADDRESS'],['add_address']]});
  
  
})
clientScene.action("add_address", ctx=>{ctx.replyWithTitle("ENTER_ADDRESS")})

clientScene
.addStep({variable: "address", cb: async (ctx)=>{
  console.log(ctx.wizard.state.address, ctx.message?.text)

  const address = ctx.wizard.state.address = ctx.message?.text;

  const amount = ctx.wizard.state.amount = 0.01;

  const {link: paymentURL, comment, address: toAddr} =
   await Payments.getTransferInfo(amount, ctx.from.id);

  ctx.wizard.state.paymentURL = paymentURL


  await ctx.replyWithKeyboard("VERIFY_USER_TITLE", 
   {name: "submit_payment_keyboard", args: [paymentURL]}, [amount, toAddr, comment, paymentURL])
  
  ctx.wizard.next();
}})
.addSelect({options: {'1': 'submit_payment'}, cb: async (ctx)=>{
  const {paymentURL, amount, address} = ctx.wizard.state;

  if (!(await Payments.isOrderPaid(ctx.from.id, amount, address))) 
   return ctx.replyWithKeyboard("VERIFY_AGAIN_USER_TITLE", 
    {name: "submit_payment_keyboard", args: [paymentURL]}, [paymentURL, amount])
  
  const connection = await tOrmCon;

  const res = await connection.query("update users set wallet_arrd = $1 where id = $2", 
   [address, ctx.from.id])
  .catch(async (e)=>{
    console.log(e);
    await ctx.replyWithTitle("DB_ERROR");
    await ctx.scene.reenter()
  });

  if (!res?.affectedRows) return await ctx.scene.enter("clientScene")

  await ctx.replyWithTitle("VERIFY_SUCCESS")
  await ctx.scene.enter("clientScene")
}})



module.exports = clientScene;
