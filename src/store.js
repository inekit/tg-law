

class Store {
    constructor(){
        this.captchaSet = new Map();
    }

    setCaptcha(id, captcha){
        this.captchaSet.set(id, captcha);
    }

    getCaptcha(id){
        console.log(this.captchaSet.get(id))
        return this.captchaSet.get(id);
    }
}

module.exports = new Store();