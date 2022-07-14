const TonWeb = require('tonweb');
var crypto = require('crypto');
var salt = "PVI8Syy6uUEbFr13M0WkQ962zNIHk40F8Iy+vVcrEhvUP3sjNA80w2/UR2civUMxdx78QI9h00zp9zEfW2FuetkIWuseYdJS7ty58b/g69gYzc5fN2MyLQPjruYRsZO19vLbaLU9rSN1inbB+1gYGfjZknrOlX9/x1Ek7bLMa+0="
//crypto.randomBytes(128).toString('base64');

//'9359567dda15fc5bf3515334ff56ad131518d1eb80e215d8855f20e91ea88c51';

class Payments{
    constructor(){

        const apiKey = process.env.API_KEY ?? "be4d286177a77090f7ad865701ca9345bc71f893bd2950b9b97f2a9bbc89c319"; 

        const apiAddr = //process.env.NODE_ENV === "production" ? 
        // "https://testnet.toncenter.com/api/v2/jsonRPC" //: 
         "https://toncenter.com/api/v2/jsonRPC";

        this.walletAddr = process.env.WALLET_ADDR;
        
        this.tonweb = new TonWeb(new TonWeb.HttpProvider(apiAddr, {apiKey}));

    }


    #hashPwd(salt, pwd) {
        var hmac = crypto.createHmac('sha256', salt);
        return hmac.update(pwd.toString()).digest('hex');
    };

    encodeComment(comment){
        return this.#hashPwd(salt,comment);
        
    }

    #compareComment(id, comment){
        console.log(id, comment, this.encodeComment(id))
        return comment === this.encodeComment(id);

    }

    async getTransferInfo(sum, comment){

        const eComment = this.encodeComment(comment)
        const link = await this.tonweb.utils.formatTransferUrl(this.walletAddr, 
            this.tonweb.utils.toNano(sum.toString()), eComment);

        return {
            link,
            address: this.walletAddr,
            comment: eComment
        }
    }

    async isOrderPaid(id, orderSum, customerAddr){
        const transactions = await this.tonweb.getTransactions(this.walletAddr).catch(console.log);//(new Date()).getTime()

        if (!transactions) return false;

        const checkingInfo = transactions.map(t=>{return {
            comment: t?.in_msg?.message, 
            destination: t?.in_msg?.destination,
            sum:this.tonweb.utils.fromNano(t?.in_msg?.value),
            source: t?.in_msg?.source
        }});


        const isPayed = !!(checkingInfo.findIndex(({comment, sum, destination, source})=> {
            console.log(this.#compareComment(id, comment), destination  === this.walletAddr, sum >= orderSum, source===customerAddr)
            return (this.#compareComment(id, comment) && destination  === this.walletAddr && sum >= orderSum && source===customerAddr)
        }
        )+1)
        
        //console.log(new Date(1785767000003), (new Date()).getTime())
        //console.log(checkingInfo)

        return isPayed;

    }
}

/*(async()=>{

    const p = new Payments();

    console.log(await p.isOrderPaid(p.encodeComment('комментарий'), 0.01, "EQCh-Iqo7oxGo5gTyDVsgPgH7iDoKXvqCHlSBzVMBqPtgPpw"))
   
})()*/

module.exports = new Payments();