//Imports:
const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


//Module Imports:
const {DATABASE_URL, PORT} = require('./config.js');


//Instantiation:
const app = express();


//Middleware:
app.use(express.json());


//Routes:
app.get('/', function(req, res) {
    res.send('This is a test')
})


//Server:
let server;

function runServer(databaseUrl, port = PORT) {
   return new Promise(function(resolve, reject) {
      mongoose.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function(err) {
         if (err) {
            return reject(err);
         }

         server = app
            .listen(port, function() {
               console.log(`Listening on port ${port}...`);
               resolve();
            })
            .on('error', function(err) {
               mongoose.disconnect();
               reject(err);
            });
      });
   });
}

function closeServer() {
   return mongoose.disconnect().then(function() {
      return new Promise(function(resolve, reject) {
         console.log('Closing server');
         server.close(function(err) {
            if (err) {
               return reject(err);
            }
            resolve();
         });
      });
   });
}

if (require.main === module) { 
    runServer(DATABASE_URL).catch(err => console.error(err));
}