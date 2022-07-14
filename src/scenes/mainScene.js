const { Scenes: { BaseScene } } = require('telegraf');

const { titles } = require('telegraf-steps-engine');
const tOrmCon = require("../db/connection");


const clientScene = new BaseScene('clientScene')
.enter(async ctx=>{

  const { edit, isNewUser } = ctx.scene.state;

  let userObj = ctx.scene.state.userObj = await getUser(ctx);

  const name = getUserName(ctx);

  const connection = await tOrmCon;

  if (!userObj) {

    await ctx.replyWithTitle("GREETING");

    userObj = await connection.getRepository("User")
      .save({id: ctx.from.id })
      .catch(async (e)=>{
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });
  }

  if (!userObj.wallet_arrd) return await ctx.scene.enter('verificationScene');
   

  if (userObj?.user_id) {
  } else if (userObj?.loginAgo!=="0") {


    await connection.query(
      "UPDATE users u SET last_use = now() WHERE id = $1",
      [ctx.from?.id])
      .catch((e)=>{
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });
  }

  await ctx.replyWithKeyboard(ctx.getTitle("HOME_MENU", [name, userObj?.nft_count]),
    {name: 'main_keyboard', args: [userObj?.user_id]});
});


async function sendRules (ctx){
  const name = ctx.from?.first_name ?? ctx.from?.username ?? "Друг";

  await ctx.replyWithVideoNote(ctx.getTitle('VIDEO_NOTE_RULES_ID')).catch(e=>{});

  ctx.replyWithTitle('RULES_TITLE', [name]);
}
clientScene.hears(titles.getTitle('BUTTON_RULES','ru'), async ctx => await sendRules(ctx));

clientScene.command('help', async ctx => await sendRules(ctx));

clientScene.hears(titles.getTitle('BUTTON_FAQ','ru'), async ctx=>{
  await ctx.replyWithTitle("FAQ", [getUserName(ctx)]);
});

clientScene.hears(titles.getTitle('BUTTON_ABOUT','ru'), async ctx=>{
  await ctx.replyWithTitle("ABOUT", [getUserName(ctx)]);
});

clientScene.hears(titles.getTitle('BUTTON_ENTER_GROUP','ru'), async ctx=>{
  await ctx.replyWithKeyboard("ENTER_GROUP", {name: 'url_keyboard', args: [ctx.getTitle('MAIN_CHAT_LINK')]});
});

clientScene.hears(titles.getTitle('BUTTON_CHANGE_ADDRESS','ru'), async ctx => await ctx.scene.enter('verificationScene', {edit: true}));

clientScene.hears(titles.getTitle('BUTTON_BUY_NFT','ru'), async ctx => await ctx.scene.enter('buyScene', 
 {userObj: ctx.scene.state.userObj, edit: true}));



clientScene.hears(titles.getTitle('ADMIN_SCENE_BUTTON','ru'), ctx=>{
  ctx.scene.enter('adminScene').catch(e=>ctx.replyWithTitle(`Нет такой сцены`));
});

clientScene.hears(titles.getTitle('HELP_MODE','ru'), async ctx=>{
  ctx.scene.state.isHelpMode = true;
  await ctx.replyWithTitle("ENTER_MESSAGE");
});
clientScene.on('message', async ctx=>{
  if (!ctx.message?.text || !ctx.scene.state.isHelpMode) return;

  ctx.scene.state.helpMessage = ctx.message.text;

  ctx.replyWithKeyboard("CONFIRM", 'confirm_keyboard')
})
clientScene.action('confirm', async ctx=>{

  await ctx.replyWithTitle("MESSAGE_SEND");

  await ctx.telegram.sendMessage(296846972, ctx.getTitle("NEW_HELP", [ctx.from.username, ctx.scene.state.helpMessage]))
  ctx.scene.state.isHelpMode = false;
})

async function getUser(ctx){
  const connection = await tOrmCon;

  let userObj = (await connection.query(
    `SELECT u.id, DATE_PART('day', now() - u.last_use) login_ago,user_id, wallet_arrd, nft_count
      FROM users u left join admins a on a.user_id = u.id where u.id = $1 limit 1`,
    [ctx.from?.id])
    .catch((e)=>{
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    }));

  return userObj?.[0];
}

const getUserName =  (ctx)=> ctx.from?.first_name ?? ctx.from?.username ?? "Друг";

module.exports = clientScene;
