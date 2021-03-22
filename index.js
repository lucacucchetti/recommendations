const serverless = require('serverless-http');
const express = require('express');
const app = express();
// app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile( __dirname + "/html/" + "index.html" );
});

app.get('/recommend', function (req, res) {
    res.send('Work in progress...');
});

module.exports.handler = serverless(app);