const serverless = require('serverless-http');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const app = express();

const RECOMMENDATIONS_TABLE = process.env.RECOMMENDATIONS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;
if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  });
  console.log(dynamoDb);
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: false }));
app.use(expressLayouts);

app.set('view engine', 'ejs');

// app.use(express.static('public'));
app.get('/recommendations', function (req, res) {
  dynamoDb
    .scan({ TableName: RECOMMENDATIONS_TABLE })
    .promise()
    .then((data) => {
      res.render('index', { recommendations: data.Items });
      // res.send(html.replace('REPLACE_ME', recommendationCards(data.Items)));
    })
    .catch(console.error);
});

// Add recommendation endpoint
app.post('/recommendations', function (req, res) {
  const { title, description, author } = req.body;

  const params = {
    TableName: RECOMMENDATIONS_TABLE,
    Item: {
      id: uuidv4(),
      title: title,
      description: description,
      author: author,
      epoch: new Date().getTime(),
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create recommendation' });
    }
    res.redirect('/dev/recommendations');
  });
});

module.exports.handler = serverless(app);
