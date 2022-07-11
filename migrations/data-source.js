import process from 'node:process';

import {SnakeNamingStrategy} from 'typeorm-naming-strategies';

import User from "./entity/User.js";
import Admin from "./entity/Admin.js";
import Statistics from "./entity/Statistics.js";

import { DataSource } from "typeorm";

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
} = process.env;

console.log({
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
});

export const AppDataSource = new DataSource({
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
  //migrationsTableName: "custom_migration_table",
  migrations: ["./migrations/migrations/*.js"],
  cli: {
    "migrationsDir": "./migrations/migrations"
  },
  "migrationsDir": "./migrations/migrations",
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
});

// export default AppDataSource; //.initialize();
