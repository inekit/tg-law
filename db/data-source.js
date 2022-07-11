require('dotenv').config()
const SnakeNamingStrategy = require('typeorm-naming-strategies')
  .SnakeNamingStrategy;

let {DataSource, createConnection} = require("typeorm");
const AppDataSource = new DataSource({
    type: "postgres",
    host: "127.0.0.1",
    port: process.env.PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    entities: [
        require("./entity/User"),
        require("./entity/Admin"),
        require("./entity/Statistics")
    ],
    synchronize: false,
    logging: false,
    namingStrategy: new SnakeNamingStrategy(),
})


const connection  = AppDataSource.initialize()

module.exports = connection; 
