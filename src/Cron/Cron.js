const cron = require('node-cron')
const tOrmCon = require("../db/data-source");

module.exports = class Cron {

	constructor(ctx) {

		this.ctx = ctx
		this.ttlJob = cron.schedule(`0 10 * * *`, this.sendCaptcha)

		//this.sendCaptcha()
		
	}

	async sendCaptcha() {

		const connection = await tOrmCon;

		await connection.query('update users set is_captcha_needed = true')
		.catch(e=>{
			console.log(e)		
		})
	}

}