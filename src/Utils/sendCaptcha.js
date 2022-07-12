const store = require("../store")
const tOrmCon = require("../db/data-source")
const generateCaptcha = require("./generateCaptcha")

module.exports = async function sendCaptcha(ctx, userId){

    const {imgBuffer, answer} = await generateCaptcha();
  
    const connection = await tOrmCon;

    await connection.query("update users set captcha_request_datetime = now(), is_captcha_needed = true where id = $1", [userId]);

    store.setCaptcha(userId, answer);

    await ctx.telegram.sendMessage(userId, ctx.getTitle("CAPTCHA_ATTENTION"), {reply_markup: {remove_keyboard: true}}).catch(e=>{});
  
    await  ctx.telegram.sendPhoto(userId, { source: imgBuffer}, {caption: ctx.getTitle('ENTER_CAPTCHA')}).catch(e=>{});
  }