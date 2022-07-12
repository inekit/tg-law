const process  = require('node:process');
const console  = require('node:console');

const { AppDataSource } = require('./data-source');

AppDataSource
  .initialize()
  .then(()=>{
    console.log('connected');
    AppDataSource
      .runMigrations()
      .then((data)=>{
        console.log('runMigrations data', data);
      })
      .catch(error=>{
        console.log('env-test error:',error);
      });
  })
  .catch((err)=>{
     console.error('error init', err);
  });
