const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express();

const {DATABASE_URL, PORT} = require('./config.js');




app.get('/', function(req, res) {
    res.send('This is a test')
})

let server;
server = app.listen('3000', function() {
    console.log('Your app is listening on port 3000...');
})


function runServer(databaseUrl, port=PORT) { 
    return new Promise( function(resolve, reject) {    
        mongoose
            .connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function(err) { 
              if (err) {          
                  return reject(err);  
              }       

              server = app.listen(port, function() {    
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

function closeServer() {                                                                 // 3.8 - Close server (for integration tests).
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }