const { Composer, Scenes: { BaseScene, WizardScene } } = require('telegraf')
const titles = require('telegraf-steps-engine/middlewares/titles')
const main_menu_button = 'admin_back_keyboard'
const tOrmCon = require("../db/data-source");
const noneListener = new Composer(),  addListener = new Composer(), captchaListener = new Composer(),  userIdListener = new Composer();

const adminScene = new WizardScene('adminScene', noneListener, addListener, captchaListener, userIdListener)

adminScene.enter(async ctx=>{
    const connection = await tOrmCon

    connection.getRepository("Admin")
    .findOne({where: {user_id: ctx.from?.id}})
    .then((res) => {
        if (!res)  return ctx.scene.enter('clientScene');
        if (!res.canUpdateAdmins) return ctx.replyWithKeyboard('ADMIN_MENU_ACTIONS', 'admin_main_keyboard')
        return ctx.replyWithKeyboard('ADMIN_MENU_ACTIONS', 'admin_main_keyboard_owner')
    })
    .catch((e)=>{
        console.log(e)
        ctx.replyWithTitle("DB_ERROR")
    })

})


adminScene.hears(titles.getValues('BUTTON_CHANGE_TEXT'), ctx => ctx.scene.enter('changeTextScene', { main_menu_button }))

adminScene.hears(titles.getValues('BUTTON_CAPTCHA'), async ctx => {

    await ctx.replyWithKeyboard('CAPTCHA_ACTIONS', 'captcha_actions_keyboard');

    ctx.wizard.selectStep(2);
})

captchaListener.action('send_captcha', async ctx=>{
    await ctx.answerCbQuery().catch(console.log);

    const connection = await tOrmCon

    await connection.query('update users set is_captcha_needed = true')
    .then(res=>{
        ctx.replyWithTitle('CAPTCHA_ADD_SUCCESS');
    })
    .catch(e=>{
        ctx.replyWithTitle('DB_ERROR');
    
    })
})

captchaListener.action('cancel_captcha', async ctx=>{
    await ctx.answerCbQuery().catch(console.log);

    await ctx.replyWithTitle('ENTER_CAPTCHA_ID');

    ctx.wizard.next();

})

userIdListener.on('message', async ctx=>{

    ctx.scene.state.userId = ctx.message?.forward_from?.id ?? ctx.message?.text;

    if (!ctx.scene.state.userId) return ctx.replyWithTitle('NO_ID');

    const connection = await tOrmCon

    await connection.query('update users set is_captcha_needed = false where id = $1', [ctx.scene.state.userId])
    .then(res=>{
        ctx.replyWithTitle('CAPTCHA_REMOVE_SUCCESS');
    })
    .catch(e=>{
        console.log(e)
        ctx.replyWithTitle('DB_ERROR');
    
    })
})




adminScene.hears(titles.getValues('BUTTON_ADD'), ctx => {
    ctx.replyWithTitle('ENTER_ADD_TEXT');

    console.log(1)
    ctx.wizard.selectStep(1);
})

addListener.on('message', async ctx=>{

    if (!ctx.message?.text) return ctx.replyWithTitle('NO_TEXT');

    ctx.wizard.state.add_text = ctx.message.text;

    await ctx.replyWithKeyboard('CONFIRM_ADDING_ADD', 'confirm_keyboard');
})

addListener.action('confirm', async ctx=>{
    await ctx.answerCbQuery().catch(console.log);

    const connection = await tOrmCon

    let usersIds = (await connection.query(
            `SELECT u.id FROM users u`, 
            [ctx.from?.id])
        .catch((e)=>{
            console.log(e)
            ctx.replyWithTitle("DB_ERROR")
        }))?.map(el=>el.id)

    usersIds.forEach(id=>{
        ctx.telegram.sendMessage(id, ctx.wizard.state.add_text).catch(console.log)
    })

    ctx.scene.reenter()
})

adminScene.hears(titles.getValues('BUTTON_ADMINS'), ctx => ctx.scene.enter('adminsScene', { main_menu_button }))

adminScene.hears(titles.getValues('BUTTON_CLIENT_MENU'), ctx => ctx.scene.enter('clientScene'))



module.exports = adminScene