const cron = require('node-cron')
const tOrmCon = require("../db/connection");
const broadCast = require('../Utils/broadCast')
const sendCaptcha = require('../Utils/sendCaptcha')

module.exports = class Cron {

	constructor(ctx) {

		this.ctx = ctx
		this.ttlJob = cron.schedule(`0 10 * * *`, this.broadCastCaptcha)

		//this.broadCastCaptcha()
		
	}

	async broadCastCaptcha() {

		const connection = await tOrmCon;

		let usersIds = (await connection.query(
			`SELECT u.id FROM users u left join admins a on a.user_id = u.id where a.user_id isnull`)
		.catch((e)=>{
			console.log(e)
		}))?.map(el=>el.id)

		broadCast({users: usersIds, callback: (userId)=>{
			sendCaptcha(this.ctx,userId)
		}})

	}

}