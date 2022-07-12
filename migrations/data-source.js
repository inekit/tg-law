const process = require('node:process');

const  {SnakeNamingStrategy} = require('typeorm-naming-strategies');

const User = require('./entity/User');
const Admin  = require('./entity/Admin');
const Statistics  = require('./entity/Statistics');

const { DataSource } = require('typeorm');

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
} = process.env;

// console.log({
//   DB_HOST,
//   DB_PORT,
//   DB_USER,
//   DB_PASSWORD,
//   DB_DATABASE,
// });

const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  entities: [
    User, Admin, Statistics
  ],
  synchronize: false,
  migrationsTableName: "custom_migration_table",
  migrations: ["./migrations/*.js"],
  cli: {
    "migrationsDir": "./migrations"
  },
  "migrationsDir": "./migrations",
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
});

module.exports.AppDataSource = AppDataSource;

// export default AppDataSource; //.initialize();
