const SnakeNamingStrategy = require('typeorm-naming-strategies')
  .SnakeNamingStrategy;

let {DataSource, createConnection} = require("typeorm");
const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
        require("./entity/User"),
        require("./entity/Admin"),
        require("./entity/Statistics")
    ],
    synchronize: false,
    logging: false,
    namingStrategy: new SnakeNamingStrategy(),
});

const connection  = AppDataSource.initialize();

module.exports = connection;
