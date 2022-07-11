const { Scenes: { BaseScene } } = require('telegraf');

const { titles } = require('telegraf-steps-engine');
const tOrmCon = require("../db/data-source");
const generateCaptcha = require("../Utils/generateCaptcha");
const checkSubscription = require("../Utils/checkSubscription");
const isCaptchaNeeded = require("../Utils/isCaptchaNeeded");

async function getUser(ctx){
  const connection = await tOrmCon;

  let userObj = (await connection.query(
    `SELECT u.id, DATE_PART('day', now() - u.last_use) login_ago,user_id, u.is_captcha_needed, count(u2.id) referals, u.is_subscribed, count(u2.is_subscribed_private::int) private_referals, count(u2.is_subscribed::int)*5+count(u2.is_subscribed_private::int)*50 +u.is_subscribed_private::int*100 balance
        FROM users u left join users u2 on u.id = u2.referer_id
        left join admins a on a.user_id = u.id where u.id = $1
        group by u.id,  a.user_id
        limit 1;`,
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

        const { edit, isNewUser } = ctx.scene.state;

        let userObj = ctx.scene.state.userObj = await getUser(ctx);

        const name = getUserName(ctx);

        const link = `https://t.me/METABUNNY_bot/?start=botuser-${ctx?.from?.id}`;

        const connection = await tOrmCon;

        if (!userObj) {

          const referer_id = ctx.startPayload?.split("-")[1];

          if (parseInt(referer_id)===ctx.from?.id) referer_id = undefined;

          userObj = await connection.getRepository("User")
            .save({id: ctx.from.id, referer_id, is_subscribed: await checkSubscription(ctx, process.env.CHAT_ID)})
            .catch((e)=>{
              console.log(e);
              ctx.replyWithTitle("DB_ERROR");
            });
        }


        if (userObj?.is_captcha_needed) return await sendCaptcha(ctx);

        if (!await checkSubscription(ctx, process.env.CHAT_ID)) return await ctx.replyWithKeyboard(ctx.getTitle("GREETING", [name]),'i_subscribed_keyboard');

        setTimeout(async ()=>{
          if (!await checkSubscription(ctx, process.env.CHAT_ID)) await ctx.replyWithKeyboard("NOT_SUBSCRIBED",'i_subscribed_keyboard');
        }, 60000);


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

        await ctx.replyWithVideoNote(ctx.getTitle('VIDEO_NOTE_ID'));

        await ctx.replyWithKeyboard(ctx.getTitle("HOME_MENU_2",
                                                 [userObj?.referals ?? 0, userObj?.private_referals ?? 0, userObj?.balance ?? 0,  link ]),
                                    {name: 'main_keyboard', args: [userObj?.user_id]});
      });

clientScene.hears(titles.getTitle('BUTTON_RULES','ru'), async ctx=>{

  const name = ctx.from?.first_name ?? ctx.from?.username ?? "Друг";

  ctx.replyWithTitle('RULES_TITLE', [name]);
});

clientScene.hears(titles.getTitle('BUTTON_FREE_NFT','ru'), async ctx=>{

  ctx.replyWithPhoto(ctx.getTitle("FREE_NFT_PHOTO"), {caption: ctx.getTitle('FREE_NFT_TITLE'), parse_mode: "HTML"}).catch(e=>{
    ctx.replyWithTitle('FREE_NFT_TITLE');
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

  ctx.editMenu('SUBSCRIBE_PRIVATE_TITLE', {name: 'url_check_keyboard', args: ['LINK_PRIVATE']});
});


clientScene.action(/^i_subscribed_(.+)$/g, async ctx=>{


  const connection = await tOrmCon;

  if (ctx.match?.[1]===ctx.getTitle('LINK_ADD')) {

    console.log(1);


    if (!await checkSubscription(ctx, process.env.ADD_CHAT_ID))
      return await ctx.answerCbQuery(ctx.getTitle("NOT_SUBSCRIBED_CB")).catch(console.log);;

    await connection.query(
      "UPDATE users u SET is_subscribed_add = true WHERE id = $1",
      [ctx.from?.id])
      .catch((e)=>{
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });

    await ctx.answerCbQuery(ctx.getTitle("SUBSCRIBED_CB")).catch(console.log);
  }

  if (!await checkSubscription(ctx, process.env.PRIVATE_CHAT_ID))
    return await ctx.answerCbQuery(ctx.getTitle("NOT_SUBSCRIBED_PRIVATE_CB")).catch(console.log);;

  await connection.query(
    "UPDATE users u SET is_subscribed_private = true WHERE id = $1",
    [ctx.from?.id])
    .catch((e)=>{
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  await ctx.answerCbQuery(ctx.getTitle("SUBSCRIBED_PRIVATE_CB")).catch(console.log);
  return ctx.scene.reenter();

});


clientScene.hears(titles.getTitle('I_SUBSCRIBED','ru'), async ctx=>{

  const connection = await tOrmCon;

  if (!await checkSubscription(ctx, process.env.CHAT_ID)) return ctx.replyWithTitle("NOT_SUBSCRIBED");

  await connection.query(
    "UPDATE users u SET is_subscribed = true WHERE id = $1",
    [ctx.from?.id])
    .catch((e)=>{
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  const userObj = ctx.scene.state.userObj;

  const name = getUserName(ctx);

  const link = `https://t.me/METABUNNY_bot/?start=botuser-${ctx?.from?.id}`;

  return await ctx.replyWithKeyboard(ctx.getTitle("HOME_MENU_GREETING", [name,userObj?.referals ?? 0, userObj?.private_referals ?? 0, userObj?.balance ?? 0,  link ]),{name: 'main_keyboard', args: [userObj?.user_id]});

});

clientScene.hears(titles.getTitle('I_SUBSCRIBED_PRIVATE','ru'), async ctx=>{

  const connection = await tOrmCon;

  if (!await checkSubscription(ctx, process.env.PRIVATE_CHAT_ID)) return ctx.replyWithTitle("NOT_SUBSCRIBED_PRIVATE");

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

  if (checkSubscription(ctx, process.env.CHAT_ID)) {

    const userObj = ctx.scene.state.userObj;

    const name = getUserName(ctx);

    const link = `https://t.me/METABUNNY_bot/?start=botuser-${ctx?.from?.id}`;

    return await ctx.replyWithKeyboard(ctx.getTitle("HOME_MENU_GREETING", [name,userObj?.referals ?? 0, userObj?.private_referals ?? 0, userObj?.balance ?? 0,  link ]),{name: 'main_keyboard', args: [userObj?.user_id]});

  }

  return ctx.scene.reenter();

});

async function sendCaptcha(ctx){

  const {imgBuffer, answer} = await generateCaptcha();

  ctx.scene.state.captchaAnswer = answer;

  ctx.replyWithPhoto({ source: imgBuffer}, {caption: ctx.getTitle('ENTER_CAPTCHA')});
}

module.exports = clientScene;
