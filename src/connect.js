const AWS = require("aws-sdk");

AWS.config.update({
  region: "ap-southeast-2",
  endpoint: "https://dynamodb.ap-southeast-2.amazonaws.com"
});

export const dynamodb = new AWS.DynamoDB.DocumentClient();
