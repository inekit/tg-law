const { Telegraf, Composer } = require('telegraf');
const tOrmCon = require("../db/data-source");

module.exports = Telegraf.on('chat_member', Telegraf.optional(

    async ctx => {

        const connection = await tOrmCon;

        const chatMember = ctx.update.chat_member?.new_chat_member;

        const id = chatMember?.user?.id;

        const chatId = ctx.chat.id?.toString();


        const isSubscribed = chatMember.status === "member" ||  chatMember.status === "administrator" || chatMember.status === "creator" ?
        true : false;

      console.log(chatId, process.env.CHAT_ID, process.env.PRIVATE_CHAT_ID);
        const query = chatId === process.env.CHAT_ID ? 'update users set is_subscribed = $1 where id = $2':
        chatId === process.env.PRIVATE_CHAT_ID ? 'update users set is_subscribed_private = $1 where id = $2':
        chatId === process.env.ADD_CHAT_ID ? 'update users set is_subscribed_add = $1 where id = $2':  undefined;

      if (query !== undefined) await (connection.query(query, [isSubscribed, id]).catch(e=>{console.log(e);}));

    }
));
