const tOrmCon = require("../db/connection");

class Statistics {
  async increaseUse(userId) {
    (await tOrmCon)
      .query(
        `INSERT INTO statistics (date,users_per_day,cart_per_day) 
            SELECT CAST(now() AS DATE), 1,0 FROM users u WHERE (CAST(now() AS DATE)<>last_use OR last_use IS NULL) and id = $1 LIMIT 1
            ON CONFLICT (date) DO UPDATE SET users_per_day = EXCLUDED.users_per_day+1`,
        [userId]
      )
      .catch((e) => {
        console.log(e);
      });
  }
}

module.exports = new Statistics();
