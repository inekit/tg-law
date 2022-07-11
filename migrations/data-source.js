import {SnakeNamingStrategy} from 'typeorm-naming-strategies';

import User from "./entity/User.js";
import Admin from "./entity/Admin.js";
import Statistics from "./entity/Statistics.js";

import {DataSource, createConnection} from "typeorm";
const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: process.env.PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
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
    logging: false,
    namingStrategy: new SnakeNamingStrategy(),
})

export default AppDataSource//.initialize();
