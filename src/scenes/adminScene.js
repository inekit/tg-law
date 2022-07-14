const { Composer, Scenes: { BaseScene, WizardScene } } = require('telegraf')
const titles = require('telegraf-steps-engine/middlewares/titles')
const main_menu_button = 'admin_back_keyboard'
const tOrmCon = require("../db/connection");
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



adminScene.hears(titles.getValues('BUTTON_ADMINS'), ctx => ctx.scene.enter('adminsScene', { main_menu_button }))

adminScene.hears(titles.getValues('BUTTON_CLIENT_MENU'), ctx => ctx.scene.enter('clientScene'))



module.exports = adminScene