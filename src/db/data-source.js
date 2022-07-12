const process = require('process');
const SnakeNamingStrategy = require('typeorm-naming-strategies')
  .SnakeNamingStrategy;

const {DataSource, createConnection} = require("typeorm");

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
} = process.env;

const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    entities: [
        require("./entity/User"),
        require("./entity/Admin"),
        require("./entity/Statistics")
    ],
    synchronize: false,
    logging: true,
    namingStrategy: new SnakeNamingStrategy(),
});

const connection  = AppDataSource.initialize();

module.exports = connection;
