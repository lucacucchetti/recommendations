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

// const server = app.listen(8081, function () {
//    const host = server.address().address
//    const port = server.address().port
   
//    console.log("Recommendations listening at http://%s:%s", host, port)
// });

module.exports.handler = serverless(app);