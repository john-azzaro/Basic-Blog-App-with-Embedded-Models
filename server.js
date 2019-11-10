const express = require('express');
const app = express();


app.get('/', function(req, res) {
    res.send('This is a test')
})

let server;
server = app.listen('3000', function() {
    console.log('Your app is listening on port 3000...');
})