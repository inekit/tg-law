const { Telegraf, Composer } = require('telegraf')
require('dotenv').config()
const tOrmCon = require("../db/data-source");


module.exports = Telegraf.on('chat_member', Telegraf.optional(

    async ctx => {

        //console.log(ctx.update, await ctx.telegram.getChat(process.env.CHAT_ID))


        //console.log(ctx.telegram.getChatMember(process.env.CHAT_ID, ctx.update.chat_member.invite_link))

        //console.log(ctx.update.chat_member?.new_chat_member)

        const connection = await tOrmCon;

        const chatMember = ctx.update.chat_member?.new_chat_member;

        const id = chatMember?.user?.id;

        const chatId = ctx.chat.id?.toString();


        const isSubscribed = chatMember.status === "member" ||  chatMember.status === "administrator" || chatMember.status === "creator" ?
        true : false;

        console.log(chatId, process.env.CHAT_ID, process.env.PRIVATE_CHAT_ID)
        const query = chatId === process.env.CHAT_ID ? 'update users set is_subscribed = $1 where id = $2': 
        chatId === process.env.PRIVATE_CHAT_ID ? 'update users set is_subscribed_private = $1 where id = $2': 
        chatId === process.env.ADD_CHAT_ID ? 'update users set is_subscribed_add = $1 where id = $2':  undefined;

        await (connection.query(query, [isSubscribed, id]).catch(e=>{console.log(e)}));

        return true
    }
))