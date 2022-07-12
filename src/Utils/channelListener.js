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

      //console.log(chatId, process.env.CHAT_ID, process.env.PRIVATE_CHAT_ID);

      const query = chatId === process.env.CHAT_ID ? 'update users set is_subscribed = $1 where id = $2':
      chatId === process.env.PRIVATE_CHAT_ID ? 'update users set is_subscribed_private = $1 where id = $2':
      chatId === process.env.ADD_CHAT_ID ? 'update users set is_subscribed_add = $1 where id = $2':  undefined;

      const userObj = (await connection.query("select referer_id,is_subscribed,is_subscribed_private,is_subscribed_add from users where id = $1 limit 1;",[ctx.from?.id]).catch(e=>{}))?.[0]

      let title;
      if (isSubscribed) {
        
        const getRefererInfo = async (isPrivate) => (await connection.query(`SELECT u.id, 
        sum((case when u2.is_subscribed isnull then false else u2.is_subscribed end)::int)+1 referals,
        sum((case when u2.is_subscribed_private isnull then false else u2.is_subscribed_private end)::int)+1 private_referals, 
          least(sum((case when u2.is_subscribed isnull then false else u2.is_subscribed end)::int)+$2, 20) * 5  +
          sum((case when u2.is_subscribed_private isnull then false else u2.is_subscribed_private end)::int+$3)*40 + 
          u.is_subscribed_private::int*80 + 
          u.is_subscribed_add::int*5 balance
            FROM users u left join users u2 on u.id = u2.referer_id
            left join admins a on a.user_id = u.id where u.id = $1
            group by u.id,  a.user_id
            limit 1; `, [userObj?.referer_id, +!isPrivate, +!!isPrivate]).catch(console.log))?.[0]

        const username = `@${ctx?.from?.username}`


        if (chatId === process.env.CHAT_ID) {
        
          if (!userObj || userObj?.is_subscribed===true || !userObj?.referer_id) return;
  
          const {referals, balance} = await getRefererInfo() ?? {}

          title = ctx.getTitle('NEW_REFERER', [username, referals, balance])
        } 
        else if (chatId === process.env.PRIVATE_CHAT_ID) {
            
          if (!userObj || userObj.is_subscribed_private===true || !userObj?.referer_id) return;
  
          const {referals_private, balance} = await getRefererInfo(true) ?? {}
          title = ctx.getTitle('NEW_REFERER_PRIVATE', [username, referals_private, balance])
  
        } 
        else if (chatId === process.env.ADD_CHAT_ID && (!userObj || userObj?.is_subscribed_add===true)) return;
      } else {
        if (chatId === process.env.CHAT_ID && (!userObj || userObj?.is_subscribed===false)) return;
        else if (chatId === process.env.PRIVATE_CHAT_ID && (!userObj || userObj?.is_subscribed_private===false)) return;
        else if (chatId === process.env.ADD_CHAT_ID && (!userObj || userObj?.is_subscribed_add===false)) return;
      }
      

      if (!query) return;

      await (connection.query(query, [isSubscribed, id])
        .then(r=>{
          if (userObj?.referer_id && title) ctx.telegram.sendMessage(userObj?.referer_id, title)
        })
        .catch(e=>{console.log(e);}));
      
       
      
      

    }
));
