const process  = require('node:process');
const console  = require('node:console');

// const {
//   DB_HOST,
//   DB_PORT,
//   DB_USER,
//   DB_PASSWORD,
//   DB_DATABASE,
// } = process.env;

// console.log({
//   DB_HOST,
//   DB_PORT,
//   DB_USER,
//   DB_PASSWORD,
//   DB_DATABASE,
// });

// import {DataSource, createConnection} from "typeorm";

// createConnection({
//   type: "postgres",
//   host: DB_HOST,
//   port: DB_PORT,
//   username: DB_USER,
//   password:  DB_PASSWORD,
//   database: DB_DATABASE,
//   logging: true,
// })
//   .then(async connection=>{
//     console.log('connected');
//     // console.log(connection);
//   })
//   .catch(error=>{
//     console.error(error);
//   });


const { AppDataSource }  = require('./data-source');

AppDataSource
  .initialize()
  .then(()=>{
    console.log('connected');
    AppDataSource
      .runMigrations()
      .then((data)=>{
        console.lg('runMigrations data', data);
      })
      .catch(error=>{
        console.log('env-test error:',error);
      });

  }).catch((err)=>{
    console.error('error init', err);
  });


// AppDataSource
//   .connection()
//   .runMigrations()
//   .then((data)=>{
//     console.lg('runMigrations data', data);
//   })
//   .catch(error=>{
//     console.log('env-test error:',error);
//   });

//process.exit(0);
