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

// console.log('process.env',process.env);

import {DataSource, createConnection} from "typeorm";

createConnection({})
  .then(async connection=>{
    console.log('connected');
    console.log(connection);
  })
  .catch(error=>{
    console.error(error);
  });
