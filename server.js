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