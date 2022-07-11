const { Markup } = require('telegraf')

const callbackButton = Markup.button.callback
const urlButton = Markup.button.url
const { inlineKeyboard } = Markup



exports.url_check_keyboard = (ctx, linkTitle ) => {

    const keyboard = inlineKeyboard([
        urlButton(ctx.getTitle('LINK_NAME'), ctx.getTitle(linkTitle)),
        callbackButton(ctx.getTitle("BUTTON_CHECK_SUBSCRIBE"), `i_subscribed_${ctx.getTitle(linkTitle)}`),
        callbackButton(ctx.getTitle("BUTTON_BACK"), 'back'),

    ], { columns: 1 })

    return keyboard
}


exports.subscribe_additional_keyboard = (ctx, subscribedPrivate ) => {

    const keyboard = inlineKeyboard([], { columns: 1 })

    /*const keyboard = inlineKeyboard([
        callbackButton(ctx.getTitle("BUTTON_SUBSCRIBE_ADD"), 'subscribeAdd'),
    ], { columns: 1 })*/

    if (!subscribedPrivate) keyboard.reply_markup.inline_keyboard.push([callbackButton(ctx.getTitle("BUTTON_SUBSCRIBE_PRIVATE"), 'subscribePrivate'),])

    return keyboard
}

exports.admins_actions_keyboard = (ctx ) => {

    const keyboard = inlineKeyboard([
        callbackButton(ctx.getTitle("BUTTON_ADD_ADMIN"), 'addAdmin'),
        callbackButton(ctx.getTitle("BUTTON_DELETE_ADMIN"), 'deleteAdmin')
    ], { columns: 2 })

    return keyboard
}

exports.captcha_actions_keyboard = (ctx ) => {

    const keyboard = inlineKeyboard([
        callbackButton(ctx.getTitle("BUTTON_SEND_CAPTCHA"), 'send_captcha'),
        callbackButton(ctx.getTitle("BUTTON_CANCEL_CAPTCHA"), 'cancel_captcha')
    ], { columns: 1 })

    return keyboard
}


exports.change_text_actions_keyboard = (ctx ) => {

    const keyboard = inlineKeyboard([
        callbackButton(ctx.getTitle("BUTTON_CHANGE_GREETING"), 'change_greeting'),
        callbackButton(ctx.getTitle("BUTTON_CHANGE_HELP"), 'change_help'),
        callbackButton(ctx.getTitle("BUTTON_CHANGE_CARD"), 'change_card'),
        callbackButton(ctx.getTitle("BUTTON_CHANGE_PHOTO"), 'change_photo')
    ], { columns: 1 })

    return keyboard
}


exports.admins_list_keyboard = (ctx, admins) => {

    const keyboard = inlineKeyboard(admins.map(({ userId }) => callbackButton(userId, "admin-"+userId)), { columns: 2 })

    return keyboard
}


exports.add_delete_keyboard = (ctx ) => {

    const keyboard = inlineKeyboard([
        callbackButton("ADD", 'add'),
        callbackButton("DELETE", 'delete')
    ], { columns: 2 })

    return keyboard
}





exports.custom_keyboard = (ctx, bNames, bLinks) => {

    let k=inlineKeyboard([])

    if (bNames.length!=bLinks.length) return k;

    bNames.forEach((name,id)=>{
        k.reply_markup.inline_keyboard.push([callbackButton(ctx.getTitle(name), bLinks[id])])
    })

    return k;
}

exports.custom_obj_keyboard = (ctx, bNamesObj) => {
    let k=inlineKeyboard([])

    Object.entries(bNamesObj)?.forEach(([name,link])=>{
       // console.log(name, link)
        k.reply_markup.inline_keyboard.push([callbackButton(ctx.getTitle(name), link)])
    })

    return k;
}



exports.dictionary_keyboard = (dictionary, tag)=> {
    let k=inlineKeyboard([], { columns: 2 })

    dictionary.forEach((type_name,id)=>{
        k.reply_markup.inline_keyboard.push([callbackButton(type_name, `${tag}-${id}`)])
    })

    return k;
}


exports.skip_keyboard = (ctx) => this.custom_keyboard(ctx,["SKIP"],["skip"])


exports.greetings_keyboard = (ctx) => this.custom_keyboard(ctx,["IUNDERSTOOD"],["confirm"])

exports.greetings_fin_keyboard = (ctx) => this.custom_keyboard(ctx,["FIN"],["fin"])

exports.skip_previous_keyboard = (ctx) => inlineKeyboard([
        
    callbackButton(ctx.getTitle('BUTTON_PREVIOUS'), 'previous_step'),
    callbackButton(ctx.getTitle('BUTTON_SKIP'), 'skip'),


], { columns: 2 })



 

exports.confirm_cancel_keyboard = (ctx) => inlineKeyboard([

    callbackButton(ctx.getTitle('BUTTON_CONFIRM'), 'confirm'),
    callbackButton(ctx.getTitle('BUTTON_CANCEL'), 'cancel')

], { columns: 1 })



exports.go_back_keyboard = (ctx) => inlineKeyboard([

    callbackButton(ctx.getTitle('BUTTON_GO_BACK'), 'go_back')
])



exports.skip_keyboard = (ctx) => inlineKeyboard([

    callbackButton(ctx.getTitle('BUTTON_SKIP'), 'skip')
])

exports.cancel_keyboard = (ctx) => inlineKeyboard([

    callbackButton(ctx.getTitle('BUTTON_CANCEL'), 'cancel')
])

exports.confirm_keyboard = (ctx) => inlineKeyboard([

    callbackButton(ctx.getTitle('BUTTON_CONFIRM'), 'confirm')
])

