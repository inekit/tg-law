import console from 'node:console';

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

import {DataSource, createConnection} from "typeorm";

createConnection({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password:  DB_PASSWORD,
  database: DB_DATABASE,
  logging: true,
})
  .then(async connection=>{
    console.log('connected');
    // console.log(connection);
  })
  .catch(error=>{
    console.error(error);
  });
