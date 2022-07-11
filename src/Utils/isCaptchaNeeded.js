const tOrmCon = require("../db/data-source");

module.exports = async function(ctx){

    const connection = await tOrmCon

    return (await connection.query(
        "SELECT id, is_captcha_needed FROM users u where u.id = $1 limit 1", 
        [ctx.from?.id])
    .catch((e)=>{
        console.log(e)
        ctx.replyWithTitle("DB_ERROR");
    }))?.[0]?.['is_captcha_needed']
}