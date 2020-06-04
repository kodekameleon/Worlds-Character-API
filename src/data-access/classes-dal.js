import {connect} from "./dynamodb";

const TABLE_NAME = "worlds-classes";

export class ClassesDAL {
  static async create(accountId, object) {
    try {
      await connect.dbclient.put({
        TableName: TABLE_NAME,
        Item: {accountId, ...object},
        ConditionExpression: "attribute_not_exists(uniqueId)"
      }).promise();
      return true;
    } catch (err) {
      if (err.code !== "ConditionalCheckFailedException") {
        throw err;
      }
    }
    return false;
  }

  static async list(accountId, {limit, fields, pageKey}) {
    const res = await connect.dbclient.query({
      TableName: TABLE_NAME,
      Select: fields && Object.keys(fields).length > 0 ? "SPECIFIC_ATTRIBUTES" : "ALL_ATTRIBUTES",
      Limit: limit ? limit : undefined,
      ExclusiveStartKey: pageKey ? pageKey : undefined,
      ProjectionExpression: fields && Object.keys(fields).length > 0 ? "" : undefined,
      KeyConditionExpression: "accountId = :accountId",
      ExpressionAttributeValues: {
        ":accountId": accountId
      }
    }).promise();
    return res;
  }

  static async scan(accountId, {limit, fields, pageKey}) {
    const res = await connect.dbclient.scan({
      TableName: TABLE_NAME,
      Select: fields && Object.keys(fields).length > 0 ? "SPECIFIC_ATTRIBUTES" : "ALL_ATTRIBUTES",
      Limit: limit ? limit : undefined,
      ExclusiveStartKey: pageKey ? pageKey : undefined,
      ProjectionExpression: fields && Object.keys(fields).length > 0 ? "" : undefined,
      // KeyConditionExpression: "accountId = :accountId",
      // ExpressionAttributeValues: {
      //   ":accountId": accountId
      // }
    }).promise();

    return {
      items: res.Items,
      pageKey: res.LastEvaluatedKey
    };
  }
}
