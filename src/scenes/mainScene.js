const { Scenes: { BaseScene } } = require('telegraf');

const { titles } = require('telegraf-steps-engine');
const tOrmCon = require("../db/data-source");
const generateCaptcha = require("../Utils/generateCaptcha");
const checkSubscription = require("../Utils/checkSubscription");
const isCaptchaNeeded = require("../Utils/isCaptchaNeeded");

async function getUser(ctx){
  const connection = await tOrmCon;

  let userObj = (await connection.query(
    `SELECT u.id, DATE_PART('day', now() - u.last_use) login_ago,user_id, u.is_captcha_needed, 
    sum((case when u2.is_subscribed isnull then false else u2.is_subscribed end)::int) referals, u.is_subscribed, u.is_subscribed_private, u.is_subscribed_add, 
    sum((case when u2.is_subscribed_private isnull then false else u2.is_subscribed_private end)::int) private_referals, 
      least(sum((case when u2.is_subscribed isnull then false else u2.is_subscribed end)::int), 20) * 5  +
      sum((case when u2.is_subscribed_private isnull then false else u2.is_subscribed_private end)::int)*40 + 
      u.is_subscribed_private::int*80 + 
      u.is_subscribed_add::int*5 balance
      FROM users u left join users u2 on u.id = u2.referer_id
      left join admins a on a.user_id = u.id where u.id = $1
      group by u.id,  a.user_id`,
    [ctx.from?.id])
                 .catch((e)=>{
                   console.log(e);
                   ctx.replyWithTitle("DB_ERROR");
                 }));

  return userObj?.[0];
}

const getUserName =  (ctx)=> ctx.from?.first_name ?? ctx.from?.username ?? "Друг";

const clientScene = new BaseScene('clientScene')
.enter(async ctx=>{

  //ctx.replyWithHTML('ffrfr', {reply_markup: {remove_keyboard: true}})

  const { edit, isNewUser } = ctx.scene.state;

  let userObj = ctx.scene.state.userObj = await getUser(ctx);

  console.log(userObj)

  const name = getUserName(ctx);

  const link = `https://t.me/METABUNNY_bot/?start=botuser-${ctx?.from?.id}`;

  const connection = await tOrmCon;

  const is_subscribed = await checkSubscription(ctx, process.env.CHAT_ID);
  const is_subscribed_private = await checkSubscription(ctx, process.env.PRIVATE_CHAT_ID);
  const is_subscribed_add = await checkSubscription(ctx, process.env.ADD_CHAT_ID)


  if (!userObj) {

    let referer_id = ctx.startPayload?.split("-")[1];

    console.log('referer_id', referer_id)

    if (parseInt(referer_id)===ctx.from?.id) referer_id = undefined;

    userObj = await connection.getRepository("User")
      .save({id: ctx.from.id, referer_id, is_subscribed, is_subscribed_private, is_subscribed_add })
      .catch(async (e)=>{
        if (e.code == 23503) 
          return await connection.getRepository("User")
          .save({id: ctx.from.id, is_subscribed, is_subscribed_private, is_subscribed_add})
          .catch((e)=>{
            console.log(e);
            ctx.replyWithTitle("DB_ERROR");
          });
        
        else {
          console.log(e);
          ctx.replyWithTitle("DB_ERROR");
        }

      });
  }

  console.log(userObj)

  if (userObj?.is_captcha_needed) return await sendCaptcha(ctx);

  if (!await checkSubscription(ctx, process.env.CHAT_ID)) {

    setTimeout(async ()=>{
      if (!await checkSubscription(ctx, process.env.CHAT_ID)) await ctx.replyWithKeyboard("NOT_SUBSCRIBED",{name: 'i_subscribed_keyboard', args: ['MAIN_CHAT_LINK']});
    }, 60000);

    return await ctx.replyWithKeyboard(ctx.getTitle("GREETING", [name]),
    {name: 'i_subscribed_keyboard', args: ['MAIN_CHAT_LINK']});

  }
   


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

  await ctx.replyWithKeyboard(ctx.getTitle("HOME_MENU_2",
    [userObj?.referals ?? 0, userObj?.private_referals ?? 0, userObj?.balance ?? 0,  link ]),
    {name: 'main_keyboard', args: [userObj?.user_id]});
});


async function sendRules (ctx){
  const name = ctx.from?.first_name ?? ctx.from?.username ?? "Друг";

  await ctx.replyWithVideoNote(ctx.getTitle('VIDEO_NOTE_RULES_ID')).catch(e=>{});

  ctx.replyWithTitle('RULES_TITLE', [name]);
}
clientScene.hears(titles.getTitle('BUTTON_RULES','ru'), async ctx => await sendRules(ctx));

clientScene.command('help', async ctx => await sendRules(ctx));



clientScene.hears(titles.getTitle('BUTTON_FREE_NFT','ru'), async ctx=>{

  ctx.replyWithPhoto(ctx.getTitle("FREE_NFT_PHOTO"), {caption: ctx.getTitle('FREE_NFT_TITLE', [], 'md2'), parse_mode: "MarkdownV2"}).catch(e=>{
    ctx.replyWithTitle('FREE_NFT_TITLE', [], 'md2');
  });
});

clientScene.hears(titles.getTitle('BUTTON_ADDITIONAL_TASKS','ru'), async ctx=>{

  ctx.replyWithKeyboard('ADDITIONAL_TASKS_TITLE', {name: 'subscribe_additional_keyboard', args: [await checkSubscription(ctx, process.env.PRIVATE_CHAT_ID)]});
});

clientScene.action('subscribeAdd', async ctx=>{
  await ctx.answerCbQuery().catch(console.log);

  ctx.editMenu('SUBSCRIBE_ADD_TITLE', {name: 'url_check_keyboard', args: ['LINK_ADD']});
});

clientScene.action('subscribePrivate', async ctx=>{
  await ctx.answerCbQuery().catch(console.log);

  ctx.editMenu('SUBSCRIBE_PRIVATE_TITLE', {name: 'url_check_keyboard', args: ['LINK_PRIVATE']},[], 'md2');
});


clientScene.action(/^i_subscribed_(.+)$/g, async ctx=>{
  ctx.answerCbQuery(ctx.getTitle()).catch(console.log);

  const connection = await tOrmCon;

  if (ctx.match?.[1]==='main') {

    if (!await checkSubscription(ctx, process.env.CHAT_ID)) return ctx.replyWithKeyboard("NOT_SUBSCRIBED",{name: 'i_subscribed_keyboard', args: ['MAIN_CHAT_LINK']});

    await connection.query(
      "UPDATE users u SET is_subscribed = true WHERE id = $1",
      [ctx.from?.id])
      .catch((e)=>{
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });

    const userObj = ctx.scene.state.userObj;

    const name = getUserName(ctx);

    const link = ctx.getTitle('REFERAL_LINK', [ctx?.from?.id], 'md2')

    await ctx.replyWithVideoNote(ctx.getTitle('VIDEO_NOTE_GREETING_ID')).catch(e=>{});

    return await ctx.replyWithKeyboard("HOME_MENU_GREETING", 
    {name: 'main_keyboard', args: [userObj?.user_id]}, 
    [name,userObj?.referals ?? 0, userObj?.private_referals ?? 0, userObj?.balance ?? 0,  link ],
    'md2');
  }

  if (ctx.match?.[1]===ctx.getTitle('LINK_ADD')) {

    console.log(1);


    if (!await checkSubscription(ctx, process.env.ADD_CHAT_ID))
      return await ctx.replyWithTitle("NOT_SUBSCRIBED_CB")

    await connection.query(
      "UPDATE users u SET is_subscribed_add = true WHERE id = $1",
      [ctx.from?.id])
      .catch((e)=>{
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });

    return await ctx.replyWithTitle("SUBSCRIBED_CB")
  }

  if (ctx.match?.[1]===ctx.getTitle('LINK_PRIVATE')) {

    if (!await checkSubscription(ctx, process.env.PRIVATE_CHAT_ID))
      return await ctx.replyWithTitle("NOT_SUBSCRIBED_PRIVATE_CB")

    await connection.query(
      "UPDATE users u SET is_subscribed_private = true WHERE id = $1",
      [ctx.from?.id])
      .catch((e)=>{
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });

    await ctx.replyWithTitle("SUBSCRIBED_PRIVATE_CB")
    return ctx.scene.reenter();
  }

});


clientScene.hears(titles.getTitle('I_SUBSCRIBED_PRIVATE','ru'), async ctx=>{

  const connection = await tOrmCon;

  if (!await checkSubscription(ctx, process.env.PRIVATE_CHAT_ID)) ctx.replyWithTitle("NOT_SUBSCRIBED_PRIVATE_CB")

  await connection.query(
    "UPDATE users u SET is_subscribed_private = true WHERE id = $1",
    [ctx.from?.id])
    .catch((e)=>{
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });
  return ctx.scene.reenter();
});

clientScene.action('back', async ctx=>{
  await ctx.answerCbQuery().catch(console.log);

  ctx.editMenu('ADDITIONAL_TASKS_TITLE', {name: 'subscribe_additional_keyboard', args: [await checkSubscription(ctx, process.env.PRIVATE_CHAT_ID)]});

});




clientScene.hears(titles.getTitle('ADMIN_SCENE_BUTTON','ru'), ctx=>{
  ctx.scene.enter('adminScene').catch(e=>ctx.replyWithTitle(`Нет такой сцены`));
});




clientScene.on('message', async ctx=>{

  const connection = await tOrmCon;


  if (!(await isCaptchaNeeded(ctx))) return;

  if (ctx.message?.text !== ctx.scene.state.captchaAnswer) { ctx.replyWithTitle("WRONG_CAPTCHA");return sendCaptcha(ctx);}

  await connection.query('update users set is_captcha_needed = false where id = $1', [ctx.from?.id])
    .then(res=>{
      ctx.replyWithTitle('CAPTCHA_SUCCESS');
    })
    .catch(e=>{
      console.log(e);
      ctx.replyWithTitle('DB_ERROR');

    });

  if (!await checkSubscription(ctx, process.env.CHAT_ID)) return ctx.scene.reenter();
  
  const userObj = ctx.scene.state.userObj;

  const name = getUserName(ctx);

  const link = ctx.getTitle('REFERAL_LINK', [ctx?.from?.id], 'md2')

  await ctx.replyWithVideoNote(ctx.getTitle('VIDEO_NOTE_GREETING_ID')).catch(e=>{});

  return await ctx.replyWithKeyboard("HOME_MENU_GREETING", 
    {name: 'main_keyboard', args: [userObj?.user_id]},  
    [name,userObj?.referals ?? 0, userObj?.private_referals ?? 0, userObj?.balance ?? 0,  link ],
    'md2');

});

async function sendCaptcha(ctx){

  const {imgBuffer, answer} = await generateCaptcha();

  ctx.scene.state.captchaAnswer = answer;

  ctx.replyWithPhoto({ source: imgBuffer}, {caption: ctx.getTitle('ENTER_CAPTCHA')});
}

module.exports = clientScene;
