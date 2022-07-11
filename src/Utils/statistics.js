const tOrmCon = require("../db/data-source");

class Statistics {
    
    async increaseCart(userId){
        (await tOrmCon).query(
            `INSERT INTO statistics (date,users_per_day,cart_per_day) 
            SELECT CAST(now() AS DATE), 0,0 FROM users u WHERE (CAST(now() AS DATE)<>lastUse OR lastUse IS NULL) and id = $1 LIMIT 1
            ON CONFLICT (date) DO UPDATE SET cart_per_day = cart_per_day+1`, 
            [userId])
        .catch((e)=>{
            console.log(e)
        })
    }

    async increaseUse(userId){
        (await tOrmCon).query(
            `INSERT INTO statistics (date,users_per_day,cart_per_day) 
            SELECT CAST(now() AS DATE), 0,0 FROM users u WHERE (CAST(now() AS DATE)<>lastUse OR lastUse IS NULL) and id = $1 LIMIT 1
            ON CONFLICT (date) DO UPDATE SET users_per_day = users_per_day+1`, 
            [userId])
        .catch((e)=>{
            console.log(e)
        })
    }
}

module.exports = new Statistics()
