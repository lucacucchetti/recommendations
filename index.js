const serverless = require('serverless-http');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const app = express();
const {define_dictionary} = require('./public/dictionary');

const basePath = 'recommendations';

const RECOMMENDATIONS_TABLE = process.env.RECOMMENDATIONS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;
if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    httpOptions: {
      timeout: 1000,
    },
  });
  console.log(dynamoDb);
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

app.use(`/${basePath}/static`, express.static('public'));
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: false }));
app.use(expressLayouts);

app.set('view engine', 'ejs');

app.get(`/${basePath}`, function (req, res) {
  userLanguage = req.acceptsLanguages().toString().split(',')[0].split('-')[0];

  dynamoDb
    .scan({ TableName: RECOMMENDATIONS_TABLE })
    .promise()
    .then((data) => {
      res.render('index', { dictionary: define_dictionary(userLanguage), recommendations: data.Items.sort((a, b) => b.epoch - a.epoch) });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong.' });
    });
});

app.post(`/${basePath}/create`, function (req, res) {
  const { title, description, author } = req.body;

  const params = {
    TableName: RECOMMENDATIONS_TABLE,
    Item: {
      id: uuidv4(),
      title: title,
      description: description,
      author: author,
      epoch: Date.now(),
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create recommendation' });
    }
    res.redirect(`/${basePath}`);
  });
});

app.post(`/${basePath}/delete`, function (req, res) {
  const { id } = req.body;

  const params = {
    TableName: RECOMMENDATIONS_TABLE,
    Key: { id },
  };

  dynamoDb.delete(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: `Could not delete recommendation [${id}]` });
    }
    res.redirect(`/${basePath}`);
  });
});

app.post(`/${basePath}/vote`, function (req, res) {
  const { id, who } = req.body;

  const params = {
    TableName: RECOMMENDATIONS_TABLE,
    Key: { id },
    UpdateExpression: 'ADD votes :vote SET epoch = :epoch',
    ExpressionAttributeValues: { ':vote': dynamoDb.createSet([who]), ':epoch': Date.now() },
  };

  dynamoDb.update(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: `Could not vote recommendation [${id}] with [${who}]` });
    }
    res.status(200).json({ message: `You voted [${id}] with [${who}]` });
  });
});

app.post(`/${basePath}/remove-vote`, function (req, res) {
  const { id, who } = req.body;

  const params = {
    TableName: RECOMMENDATIONS_TABLE,
    Key: { id },
    UpdateExpression: 'DELETE votes :vote',
    ExpressionAttributeValues: { ':vote': dynamoDb.createSet([who]) },
  };

  dynamoDb.update(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: `Could not remove vote for recommendation [${id}] with [${who}]` });
    }
    res.status(200).json({ message: `You removed vote [${who}] in [${id}]` });
  });
});

module.exports.handler = serverless(app);
