const AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.DYNAMODB_REGION || "ap-southeast-2",
  endpoint: process.env.DYNAMODB_ENDPOINT || "https://dynamodb.ap-southeast-2.amazonaws.com"
});

let dynamodb, dbclient;

export const connect = {
  get dynamodb() {
    if (!dynamodb) {
      dynamodb = new AWS.DynamoDB();
    }
    return dynamodb;
  },
  get dbclient() {
    if (!dbclient) {
      dbclient = new AWS.DynamoDB.DocumentClient();
    }
    return dbclient;
  }
};
