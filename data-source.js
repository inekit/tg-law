const process = require('node:process');

const  {SnakeNamingStrategy} = require('typeorm-naming-strategies');

const User = require('./src/db/entity/User');
const Admin  = require('./src/db/entity/Admin');
const Statistics  = require('./src/db/entity/Statistics');
const Nft  = require('./src/db/entity/Nft');
const Order  = require('./src/db/entity/Order');

const { DataSource } = require('typeorm');

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
    User, Admin, Statistics, Nft, Order
  ],
  synchronize: false,
  migrationsTableName: "custom_migration_table",
  migrations: ["./src/db/migrations/*.js"],
  cli: {
    "migrationsDir": "./src/db/migrations"
  },
  "migrationsDir": "./src/db/migrations",
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
});

module.exports.AppDataSource = AppDataSource;

