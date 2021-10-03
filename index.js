import serverless from 'serverless-http';
import express from 'express';

import expressLayouts from 'express-ejs-layouts';
import AWS from 'aws-sdk';
import { uuidv4 } from 'uuid';
const app = express();

const basePath = 'recommendations';

const RECOMMENDATIONS_TABLE = process.env.RECOMMENDATIONS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;
setup();

app.use(`/${basePath}/static`, express.static('public'));
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: false }));
app.use(expressLayouts);

app.set('view engine', 'ejs');

app.get(`/${basePath}`, function (req, res) {
  res.render('index', { basePath: basePath, recommendations: [] });
});

app.get(`/${basePath}/:group`, async (req, res) => {
  const group = req.params.group;
  try {
    const data = await dynamoDb
      .scan({
        TableName: RECOMMENDATIONS_TABLE,
        FilterExpression: `groupName = :groupName`,
        ExpressionAttributeValues: { ':groupName': group },
      })
      .promise();
    res.render('index', {
      basePath: `${basePath}/${group}`,
      recommendations: data.Items.sort((a, b) => b.epoch - a.epoch),
    });
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});

app.post(`/${basePath}/:group/create`, function (req, res) {
  const group = req.params.group;
  const { title, description, author } = req.body;

  const params = {
    TableName: RECOMMENDATIONS_TABLE,
    Item: {
      id: uuidv4(),
      title: title,
      description: description,
      author: author,
      epoch: Date.now(),
      groupName: group,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create recommendation' });
    }
    res.redirect(`/${basePath}/${group}`);
  });
});

app.post(`/${basePath}/:group/delete`, function (req, res) {
  const group = req.params.group;
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
    res.redirect(`/${basePath}/${group}`);
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

function setup() {
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
}
